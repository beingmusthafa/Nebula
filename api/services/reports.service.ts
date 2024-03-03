import mongoose from "mongoose";
import adminReportsRepositoryInstance, {
  AdminReportsRepository,
} from "../repositories/adminReports.repository.js";
import tutorReportsRepositoryInstance, {
  TutorReportsRepository,
} from "../repositories/tutorReports.repository.js";
import ServiceResponse from "../types/serviceresponse.type.js";
import { generateReportPdf } from "../utils/pdf.js";
export class ReportsService {
  private adminReportsRepository: AdminReportsRepository;
  private tutorReportsRepository: TutorReportsRepository;
  private pdfGenerator: (
    report: any,
    type: "admin" | "tutor"
  ) => Promise<Buffer>;
  constructor(
    adminReportsRepository: AdminReportsRepository,
    tutorReportsRepository: TutorReportsRepository,
    pdfGenerator: (report: any, type: "admin" | "tutor") => Promise<Buffer>
  ) {
    this.adminReportsRepository = adminReportsRepository;
    this.tutorReportsRepository = tutorReportsRepository;
    this.pdfGenerator = pdfGenerator;
  }

  async getAdminPdfBuffer(
    reportId: string | mongoose.Types.ObjectId
  ): ServiceResponse<{ pdfBuffer: string }> {
    try {
      const report = await this.adminReportsRepository.findOne({
        _id: reportId,
      });
      const buffer = await this.pdfGenerator(report, "admin");
      return {
        success: true,
        message: "Report PDF generated successfully",
        statusCode: 200,
        pdfBuffer: buffer.toString("base64"),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getTutorPdfBuffer(
    reportId: string | mongoose.Types.ObjectId
  ): ServiceResponse<{ pdfBuffer: string }> {
    try {
      const report = await this.tutorReportsRepository.findOne({
        _id: reportId,
      });
      const buffer = await this.pdfGenerator(report, "tutor");
      return {
        success: true,
        message: "Report PDF generated successfully",
        statusCode: 200,
        pdfBuffer: buffer.toString("base64"),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAdminReport(
    reportId: string | mongoose.Types.ObjectId
  ): ServiceResponse<{ report: object }> {
    try {
      const report = await this.adminReportsRepository.findOne({
        _id: reportId,
      });
      return {
        success: true,
        message: "Report fetched successfully",
        statusCode: 200,
        report,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findTutorReport(
    reportId: string | mongoose.Types.ObjectId,
    tutorId: string | mongoose.Types.ObjectId
  ): ServiceResponse<{ report: object }> {
    try {
      const report = await this.tutorReportsRepository.findOne({
        _id: reportId,
        tutor: tutorId,
      });
      return {
        success: true,
        message: "Report fetched successfully",
        statusCode: 200,
        report,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAdminReports(
    type: "weekly" | "monthly" | "yearly"
  ): ServiceResponse<{ reports: object[] }> {
    try {
      const reports = await this.adminReportsRepository.find({ type });
      return {
        success: true,
        message: "Reports fetched successfully",
        statusCode: 200,
        reports,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTutorReports(
    type: "weekly" | "monthly" | "yearly",
    tutorId: string | mongoose.Types.ObjectId
  ): ServiceResponse<{ reports: object[] }> {
    try {
      const reports = await this.tutorReportsRepository.find({
        tutor: tutorId,
        type,
      });
      return {
        success: true,
        message: "Reports fetched successfully",
        statusCode: 200,
        reports,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new ReportsService(
  adminReportsRepositoryInstance,
  tutorReportsRepositoryInstance,
  generateReportPdf
);