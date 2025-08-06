import { Router, Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { CreateContractRequest, UpdateContractRequest } from '../types/contract';

export const contractRoutes = Router();

// GET /api/contracts - Get all contracts
contractRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    
    let contracts;
    if (search && typeof search === 'string') {
      contracts = await contractService.searchContracts(search);
    } else if (status && typeof status === 'string') {
      contracts = await contractService.getContractsByStatus(status as any);
    } else {
      contracts = await contractService.getAllContracts();
    }
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// GET /api/contracts/:id - Get contract by ID
contractRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await contractService.getContractById(id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// POST /api/contracts - Create new contract
contractRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const contractData: CreateContractRequest = req.body;
    
    // Basic validation
    if (!contractData.name || !contractData.company || !contractData.contractId) {
      return res.status(400).json({ error: 'Name, company, and contract ID are required' });
    }
    
    const result = await contractService.createContract(contractData);
    
    // Return the full result object that the frontend expects
    if (result.created) {
      res.status(201).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PUT /api/contracts/:id - Update contract
contractRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: Partial<CreateContractRequest> = req.body;
    
    const updatedContract = await contractService.updateContract(id, updateData);
    
    if (!updatedContract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// DELETE /api/contracts/:id - Delete contract
contractRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await contractService.deleteContract(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// GET /api/contracts/info/data - Get data storage info
contractRoutes.get('/info/data', async (req: Request, res: Response) => {
  try {
    const info = await contractService.getDataInfo();
    res.json(info);
  } catch (error) {
    console.error('Error getting data info:', error);
    res.status(500).json({ error: 'Failed to get data info' });
  }
});

// GET /api/contracts/info/stats - Get file statistics
contractRoutes.get('/info/stats', async (req: Request, res: Response) => {
  try {
    const stats = await contractService.getContractStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting file stats:', error);
    res.status(500).json({ error: 'Failed to get file stats' });
  }
});

// GET /api/contracts/export/markdown - Export contracts to Markdown
contractRoutes.get('/export/markdown', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    
    let contracts;
    if (search && typeof search === 'string') {
      contracts = await contractService.searchContracts(search);
    } else if (status && typeof status === 'string') {
      contracts = await contractService.getContractsByStatus(status as any);
    } else {
      contracts = await contractService.getAllContracts();
    }
    
    const markdown = await contractService.exportToMarkdown(contracts);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="contracts-export-${new Date().toISOString().split('T')[0]}.md"`);
    
    res.send(markdown);
  } catch (error) {
    console.error('Error exporting contracts to markdown:', error);
    res.status(500).json({ error: 'Failed to export contracts' });
  }
}); 