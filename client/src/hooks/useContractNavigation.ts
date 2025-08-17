import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Contract } from '@/types/contract';

interface UseContractNavigationProps {
  contracts: Contract[];
  currentContractId?: string;
}

export const useContractNavigation = ({ contracts, currentContractId }: UseContractNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Find current contract index and update navigation state
  useEffect(() => {
    if (currentContractId && contracts.length > 0) {
      const index = contracts.findIndex(c => c.id === currentContractId);
      console.log('Navigation hook: Found contract at index', index, 'out of', contracts.length);
      setCurrentIndex(index);
      setHasNext(index >= 0 && index < contracts.length - 1);
      setHasPrevious(index > 0);
    } else {
      console.log('Navigation hook: No contract found or no contracts available');
      setCurrentIndex(-1);
      setHasNext(false);
      setHasPrevious(false);
    }
  }, [contracts, currentContractId]);

  const goToNext = () => {
    if (hasNext && currentIndex >= 0 && currentIndex < contracts.length - 1) {
      const nextContract = contracts[currentIndex + 1];
      if (nextContract?.id) {
        navigate(`/contract/${nextContract.id}`);
      }
    }
  };

  const goToPrevious = () => {
    if (hasPrevious && currentIndex > 0) {
      const prevContract = contracts[currentIndex - 1];
      if (prevContract?.id) {
        navigate(`/contract/${prevContract.id}`);
      }
    }
  };

  const goToFirst = () => {
    if (contracts.length > 0 && contracts[0]?.id) {
      navigate(`/contract/${contracts[0].id}`);
    }
  };

  const goToLast = () => {
    if (contracts.length > 0 && contracts[contracts.length - 1]?.id) {
      navigate(`/contract/${contracts[contracts.length - 1].id}`);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < contracts.length && contracts[index]?.id) {
      navigate(`/contract/${contracts[index].id}`);
    }
  };

  // Only return navigation data when we have a valid current index
  if (currentIndex < 0 || contracts.length === 0) {
    return {
      currentIndex: 0,
      totalContracts: 0,
      hasNext: false,
      hasPrevious: false,
      goToNext: () => {},
      goToPrevious: () => {},
      goToFirst: () => {},
      goToLast: () => {},
      goToIndex: () => {},
      currentContract: null,
      nextContract: null,
      previousContract: null,
    };
  }

  // Ensure we have a valid contract at the current index
  const currentContract = contracts[currentIndex];
  if (!currentContract) {
    return {
      currentIndex: 0,
      totalContracts: 0,
      hasNext: false,
      hasPrevious: false,
      goToNext: () => {},
      goToPrevious: () => {},
      goToFirst: () => {},
      goToLast: () => {},
      goToIndex: () => {},
      currentContract: null,
      nextContract: null,
      previousContract: null,
    };
  }

  return {
    currentIndex: currentIndex + 1, // 1-based for display
    totalContracts: contracts.length,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    goToIndex,
    currentContract,
    nextContract: hasNext && contracts[currentIndex + 1] ? contracts[currentIndex + 1] : null,
    previousContract: hasPrevious && contracts[currentIndex - 1] ? contracts[currentIndex - 1] : null,
  };
};
