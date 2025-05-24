import { Logger } from "../utils/Logger";

/**
 * Interface for doctor entity
 */
export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  credentials: string;
  email: string;
  phone: string;
  availableSlots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing doctor operations
 */
export class DoctorService {
  private logger: Logger;

  // Mock data for demo purposes
  private doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiology",
      credentials: "MD, FACC - Board Certified Cardiologist",
      email: "s.johnson@agentcare.dev",
      phone: "(555) 123-4567",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Dermatology",
      credentials: "MD, PhD - Dermatology Specialist",
      email: "m.chen@agentcare.dev",
      phone: "(555) 234-5678",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrics",
      credentials: "MD, FAAP - Pediatric Medicine",
      email: "e.rodriguez@agentcare.dev",
      phone: "(555) 345-6789",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Find all doctors
   */
  public async findAll(): Promise<Doctor[]> {
    this.logger.info("Fetching all doctors");
    return [...this.doctors];
  }

  /**
   * Find doctor by ID
   * @param id - The doctor ID
   */
  public async findById(id: number): Promise<Doctor | null> {
    this.logger.info("Fetching doctor by ID", { id });
    return this.doctors.find((doctor) => doctor.id === id) || null;
  }

  /**
   * Find doctors by specialization
   * @param specialization - The specialization to search for
   */
  public async findBySpecialization(specialization: string): Promise<Doctor[]> {
    this.logger.info("Fetching doctors by specialization", { specialization });
    if (!specialization) return this.doctors;

    return this.doctors.filter((doctor) =>
      doctor.specialization
        .toLowerCase()
        .includes(specialization.toLowerCase()),
    );
  }

  /**
   * Search doctors by query
   * @param query - The search query
   */
  public async search(query: string): Promise<Doctor[]> {
    this.logger.info("Searching doctors", { query });
    if (!query) return this.doctors;

    const lowerQuery = query.toLowerCase();
    return this.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(lowerQuery) ||
        doctor.specialization.toLowerCase().includes(lowerQuery) ||
        doctor.credentials.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Create a new doctor (admin only)
   * @param doctorData - The doctor data
   */
  public async create(doctorData: Partial<Doctor>): Promise<Doctor> {
    this.logger.info("Creating new doctor", { doctorData });
    const newDoctor: Doctor = {
      id: Math.max(...this.doctors.map((d) => d.id)) + 1,
      name: doctorData.name || "",
      specialization: doctorData.specialization || "",
      credentials: doctorData.credentials || "",
      email: doctorData.email || "",
      phone: doctorData.phone || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.doctors.push(newDoctor);
    return newDoctor;
  }

  /**
   * Update doctor information
   * @param id - The doctor ID
   * @param updateData - The data to update
   */
  public async update(
    id: number,
    updateData: Partial<Doctor>,
  ): Promise<Doctor | null> {
    this.logger.info("Updating doctor", { id, updateData });
    const doctorIndex = this.doctors.findIndex((doctor) => doctor.id === id);

    if (doctorIndex === -1) return null;

    this.doctors[doctorIndex] = {
      ...this.doctors[doctorIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return this.doctors[doctorIndex];
  }

  /**
   * Delete a doctor
   * @param id - The doctor ID
   */
  public async delete(id: number): Promise<boolean> {
    this.logger.info("Deleting doctor", { id });
    const doctorIndex = this.doctors.findIndex((doctor) => doctor.id === id);

    if (doctorIndex === -1) return false;

    this.doctors.splice(doctorIndex, 1);
    return true;
  }
}
