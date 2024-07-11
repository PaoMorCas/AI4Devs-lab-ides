import express from 'express';
import { json } from 'body-parser';
import { PrismaClient, InstitutionType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Configura body-parser
app.use(json());

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post('/api/institutions', async (req: express.Request, res: express.Response) => {
  const { name, type, address } = req.body;

  // Validaciones
  if (!name || !type) {
    return res.status(400).json({ error: 'Bad Request', message: 'name and type are required fields.' });
  }

  if (!Object.values(InstitutionType).includes(type as InstitutionType)) {
    return res.status(400).json({ error: 'Bad Request', message: `The institution type '${type}' is invalid.` });
  }

  try {
    const institution = await prisma.institution.create({
      data: {
        name,
        type,
        address,
      },
    });

    return res.status(201).json({ message: 'Institution created successfully.', institution_id: institution.id });
  } catch (error) {
    console.error('Error creating institution:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred. Please try again later.' });
  }
});


app.post('/api/candidates', async (req: express.Request, res: express.Response) => {
  const { first_name, last_name, email, phone, address, education, work_experience, cv_file } = req.body;

  // Validaciones básicas
  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ message: 'Bad Request: Missing required fields.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Bad Request: Invalid email format.' });
  }

  // Aquí se deberían agregar las validaciones para institution_id y company_id
  // Esto implica verificar en la base de datos si existen los IDs proporcionados

  try {
    // Paso 2: Buscar en la base de datos si existe un instituto con ese ID
    const existingInstitute = await prisma.institution.findUnique({
      where: {
        id: education[0].institutionId,
      },
    });

    // Paso 3: Si el instituto no existe, devolver una respuesta de error
    if (!existingInstitute) {
      return res.status(404).json({ message: 'Not Found: Invalid institution_id or company_id.' });
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        address,
        cvFilePath: cv_file,
        educations: {
          create: education,
        },
        workExperiences: {
          create: work_experience,
        },
      },
    });

    return res.status(201).json({ message: 'Candidate created successfully.', candidate_id: candidate.id });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return res.status(500).json({ message: 'Internal Server Error: An unexpected error occurred. Please try again later.' });
  }
});