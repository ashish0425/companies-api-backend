const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies - Get all companies with optional filters
router.get('/', async (req, res) => {
    try {
        const { 
            name, 
            industry, 
            location, 
            minEmployees, 
            maxEmployees,
            minRevenue,
            maxRevenue,
            founded,
            search 
        } = req.query;

        let filter = {};

        // Text search across name, industry, location
        if (search) {
            filter.$text = { $search: search };
        }

        // Specific field filters
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        
        if (industry) {
            filter.industry = { $regex: industry, $options: 'i' };
        }
        
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        // Employee count range
        if (minEmployees || maxEmployees) {
            filter.employeeCount = {};
            if (minEmployees) filter.employeeCount.$gte = parseInt(minEmployees);
            if (maxEmployees) filter.employeeCount.$lte = parseInt(maxEmployees);
        }

        // Revenue range
        if (minRevenue || maxRevenue) {
            filter.revenue = {};
            if (minRevenue) filter.revenue.$gte = parseFloat(minRevenue);
            if (maxRevenue) filter.revenue.$lte = parseFloat(maxRevenue);
        }

        // Founded year
        if (founded) {
            filter.founded = parseInt(founded);
        }

        const companies = await Company.find(filter).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: companies.length,
            data: companies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// GET /api/companies/:id - Get single company
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            data: company
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// POST /api/companies - Create new company
router.post('/', async (req, res) => {
    try {
        const {
            name,
            industry,
            location,
            employeeCount,
            founded,
            revenue,
            website,
            description
        } = req.body;

        // Basic validation
        if (!name || !industry || !location || !employeeCount || !founded) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, industry, location, employeeCount, founded'
            });
        }

        const company = new Company({
            name,
            industry,
            location,
            employeeCount,
            founded,
            revenue,
            website,
            description
        });

        const savedCompany = await company.save();

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: savedCompany
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// PUT /api/companies/:id - Update company
router.put('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company updated successfully',
            data: company
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// GET /api/companies/stats/overview - Get companies statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalCompanies = await Company.countDocuments();
        
        const industryStats = await Company.aggregate([
            {
                $group: {
                    _id: '$industry',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const locationStats = await Company.aggregate([
            {
                $group: {
                    _id: '$location',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalCompanies,
                byIndustry: industryStats,
                byLocation: locationStats
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = router;
