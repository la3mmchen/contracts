import { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Contract } from '@/types/contract';
import { useContractStorage } from '@/hooks/useContractStorage';
import { DEFAULT_COVERAGE_CATEGORIES, loadCoverageConfig, CoverageBaseline, CoverageCategory } from '@/config/baselineCoverage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';

const ALL_PERSONS = 'all';

const getBasePath = () => {
  return window.location.pathname.includes('/contracts/') ? '/contracts' : '';
};

// Match a contract against a baseline's keywords (case-insensitive substring
// match across category, tags, name and company).
const contractMatchesBaseline = (contract: Contract, baseline: CoverageBaseline): boolean => {
  const haystack = [
    contract.category,
    contract.name,
    contract.company,
    ...(contract.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return baseline.keywords.some(keyword => haystack.includes(keyword.toLowerCase()));
};

const isActive = (contract: Contract): boolean =>
  contract.status === 'active' && !contract.draft;

// Normalize a familyMember value for case-insensitive, trimmed comparison.
const normalizePerson = (value?: string): string => (value ?? '').trim().toLowerCase();

const CoverageMatrix = () => {
  const navigate = useNavigate();
  const { contracts, loading } = useContractStorage();

  // Coverage config is loaded at runtime from public/coverage.json, seeded with
  // the built-in defaults so the first render is never empty.
  const [coverageCategories, setCoverageCategories] = useState<CoverageCategory[]>(
    DEFAULT_COVERAGE_CATEGORIES,
  );

  useEffect(() => {
    let active = true;
    loadCoverageConfig().then((config) => {
      if (active) setCoverageCategories(config);
    });
    return () => {
      active = false;
    };
  }, []);

  // Person (familyMember) filter. Options are derived from the contracts
  // themselves - there is no fixed config list of persons.
  const [selectedPerson, setSelectedPerson] = useState<string>(ALL_PERSONS);

  const persons = useMemo(() => {
    const set = new Set<string>();
    contracts.forEach((contract) => {
      const member = contract.familyMember?.trim();
      if (member) set.add(member);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contracts]);

  // For each category/baseline, find the matching active contracts, optionally
  // scoped to a single person.
  //
  // A category can declare its own `familyMember` scope (e.g. an "adults only"
  // insurance category). The header Person dropdown narrows further on top of
  // that (intersection):
  //   - Categories whose `familyMember` conflicts with the selected person are
  //     hidden entirely.
  //   - The contract pool for a category is restricted to both the category's
  //     familyMember (if any) and the selected person (if any).
  const matrix = useMemo(() => {
    const selected = selectedPerson === ALL_PERSONS ? undefined : normalizePerson(selectedPerson);

    return coverageCategories
      .filter((category) => {
        const categoryPerson = normalizePerson(category.familyMember);
        // Hide a person-scoped category when a *different* person is selected.
        if (selected && categoryPerson && categoryPerson !== selected) return false;
        return true;
      })
      .map((category) => {
        const categoryPerson = normalizePerson(category.familyMember);

        const activeContracts = contracts.filter((c) => {
          if (!isActive(c)) return false;
          const contractPerson = normalizePerson(c.familyMember);
          // Category-declared scope.
          if (categoryPerson && contractPerson !== categoryPerson) return false;
          // Dropdown scope (narrows further).
          if (selected && contractPerson !== selected) return false;
          return true;
        });

        const baselines = category.baselines.map((baseline) => {
          const matches = activeContracts.filter((c) => contractMatchesBaseline(c, baseline));
          return { baseline, matches };
        });

        const covered = baselines.filter((b) => b.matches.length > 0).length;

        return {
          category,
          baselines,
          covered,
          total: category.baselines.length,
        };
      });
  }, [contracts, coverageCategories, selectedPerson]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-black text-white border-b border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`${getBasePath()}/`)}
                className="text-white hover:bg-white/10 hover:scale-105 p-2 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">Coverage Matrix</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {persons.length > 0 && (
                <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                  <SelectTrigger
                    id="coverage-person-filter"
                    className="w-[160px] bg-white/10 text-white border-white/20 hover:bg-white/20"
                    aria-label="Filter coverage by person"
                  >
                    <SelectValue placeholder="All persons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_PERSONS}>All persons</SelectItem>
                    {persons.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          A health-check of your contracts grouped by life category. Green items
          are covered by an active contract; muted items are recommended
          baselines you may be missing.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading contracts…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {matrix.map(({ category, baselines, covered, total }) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      {category.label}
                      {category.familyMember && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {category.familyMember}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {covered}/{total}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {baselines.map(({ baseline, matches }) => {
                    const isCovered = matches.length > 0;
                    return (
                      <div
                        key={baseline.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        {isCovered ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                        ) : (
                          <CircleDashed className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600" />
                        )}
                        <div className="min-w-0">
                          <div className={isCovered ? 'font-medium' : 'text-muted-foreground'}>
                            {baseline.label}
                          </div>
                          {isCovered ? (
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                              {matches.map((c, i) => (
                                <Link
                                  key={c.id}
                                  to={`${getBasePath()}/contract/${c.id}`}
                                  className="hover:underline hover:text-foreground transition-colors"
                                >
                                  {c.name}
                                  {i < matches.length - 1 ? ',' : ''}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-yellow-600/80">
                              Recommended baseline
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverageMatrix;
