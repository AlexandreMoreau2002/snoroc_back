const fs = require('fs');

describe('About Controller', () => {
    let aboutController;
    let About;
    let req, res;

    beforeEach(() => {
        jest.resetModules(); // Reset cache to ensure fresh requires

        // Mock console.error to suppress error logs in tests
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock fs
        jest.mock('fs');

        // Mock About model
        jest.mock('../../../src/models/about.model', () => ({
            findOne: jest.fn(),
            create: jest.fn(),
            init: jest.fn()
        }));

        // Require modules after mocking
        aboutController = require('../../../src/controllers/about.controller');
        About = require('../../../src/models/about.model');

        req = {
            body: {},
            file: null,
            protocol: 'http',
            get: jest.fn((header) => {
                if (header === 'host') return 'localhost:3030';
                return null;
            })
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getAbout', () => {
        it('should return default content if no record found', async () => {
            About.findOne.mockResolvedValue(null);

            await aboutController.getAbout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                title: 'Titre par défaut',
                description: 'Description par défaut',
                image: null
            });
        });

        it('should return about content if record found', async () => {
            const mockAbout = { title: 'Test', description: 'Desc', image: 'img.jpg' };
            About.findOne.mockResolvedValue(mockAbout);

            await aboutController.getAbout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAbout);
        });
    });

    describe('updateAbout', () => {
        it('should create new record if none exists', async () => {
            About.findOne.mockResolvedValue(null);
            About.create.mockResolvedValue({ title: 'New', description: 'New Desc', image: null });
            req.body = { title: 'New', description: 'New Desc' };

            await aboutController.updateAbout(req, res);

            expect(About.create).toHaveBeenCalledWith({
                title: 'New',
                description: 'New Desc',
                image: null
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should update existing record', async () => {
            const mockAbout = { update: jest.fn(), image: null };
            About.findOne.mockResolvedValue(mockAbout);
            req.body = { title: 'Updated', description: 'Updated Desc' };

            await aboutController.updateAbout(req, res);

            expect(mockAbout.update).toHaveBeenCalledWith({
                title: 'Updated',
                description: 'Updated Desc'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle image upload and delete old image', async () => {
            const mockAbout = { update: jest.fn(), image: 'http://localhost:3030/uploads/old.jpg' };
            About.findOne.mockResolvedValue(mockAbout);
            req.body = { title: 'Updated', description: 'Updated Desc' };
            req.file = { filename: 'new.jpg' };

            // Mock fs.existsSync and fs.unlinkSync
            const fs = require('fs');
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => { });

            await aboutController.updateAbout(req, res);

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(mockAbout.update).toHaveBeenCalledWith({
                title: 'Updated',
                description: 'Updated Desc',
                image: 'http://localhost:3030/uploads/new.jpg'
            });
        });

        it('should handle errors in getAbout', async () => {
            About.findOne.mockRejectedValue(new Error('Database error'));

            await aboutController.getAbout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: true,
                message: "Erreur lors de la récupération du contenu About."
            });
        });

        it('should handle errors in updateAbout', async () => {
            About.findOne.mockRejectedValue(new Error('Database error'));
            req.body = { title: 'Test', description: 'Test' };

            await aboutController.updateAbout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: true,
                message: "Erreur lors de la mise à jour du contenu About."
            });
        });

        it('should create new record with image if none exists', async () => {
            About.findOne.mockResolvedValue(null);
            About.create.mockResolvedValue({ title: 'New', description: 'New Desc', image: 'http://localhost:3030/uploads/test.jpg' });
            req.body = { title: 'New', description: 'New Desc' };
            req.file = { filename: 'test.jpg' };

            await aboutController.updateAbout(req, res);

            expect(About.create).toHaveBeenCalledWith({
                title: 'New',
                description: 'New Desc',
                image: 'http://localhost:3030/uploads/test.jpg'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
