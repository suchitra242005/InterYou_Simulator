// @ts-nocheck
import { Router } from 'express';
import multer from 'multer';
import { resumeController, updateResumeSchema } from '../controllers/index.js';
import { validate } from '../middleware/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'));
    }
  },
});

router.use(authenticate);

router.post('/upload', upload.single('resume'), (req, res) => resumeController.upload(req, res));
router.get('/', (req, res) => resumeController.list(req, res));
router.get('/:id', (req, res) => resumeController.get(req, res));
router.post('/:id/parse', (req, res) => resumeController.parse(req, res));
router.patch('/:id', validate(updateResumeSchema), (req, res) => resumeController.update(req, res));
router.delete('/:id', (req, res) => resumeController.delete(req, res));
router.get('/:id/report', (req, res) => resumeController.getReport(req, res));

export default router;
