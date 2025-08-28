const Company = require('../models/Company');

// Get all companies with filters
exports.getCompanies = async (req, res) => {
    try {
        const { 
            search, 
            industry, 
            location, 
            minEmployees, 
            maxEmployees,
            page = 1, 
            limit = 10 
        } = req.query;

        let query = {};

        // Search by name, industry, or location
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by industry
        if (industry) {
            query.industry = { $regex: industry, $options: 'i' };
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by employee count range
        if (minEmployees || maxEmployees) {
            query.employeeCount = {};
            if (minEmployees) query.employeeCount.$gte = parseInt(minEmployees);
            if (maxEmployees) query.employeeCount.$lte = parseInt(maxEmployees);
        }

        const companies = await Company.find(query)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            data: companies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create company
exports.createCompany = async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json({ success: true, data: company });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get single company
exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seed sample data
exports.seedData = async (req, res) => {
    try {
        const sampleCompanies = [
            { name: "TechCorp", industry: "Technology", location: "San Francisco", employeeCount: 500, founded: 2010, revenue: 100, website: "techcorp.com" },
            { name: "HealthInc", industry: "Healthcare", location: "New York", employeeCount: 1200, founded: 2005, revenue: 250 },
            { name: "EduTech", industry: "Education", location: "Boston", employeeCount: 300, founded: 2015, revenue: 50 },
            { name: "FinanceFlow", industry: "Finance", location: "Chicago", employeeCount: 800, founded: 2008, revenue: 180 },
            { name: "RetailMax", industry: "Retail", location: "Los Angeles", employeeCount: 2000, founded: 2000, revenue: 300 }
        ];
        
        await Company.deleteMany({}); // Clear existing data
        await Company.insertMany(sampleCompanies);
        res.json({ success: true, message: 'Sample data seeded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};