import EmployeeList from "../models/employeeModels.js";
import { createExcelFile } from "../utils/excelExport.js";
import { exportPDF } from "../utils/pdfExport.js";
import { sendEmployeeCreatedEmail } from "../services/emailService.js";
export const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            dob,
            department
        } = req.body;

        const existingUser = await EmployeeList.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Employee Already Exists"
            });
        }
        // Get last employee
        const lastEmployee = await EmployeeList
            .findOne()
            .sort({ createdAt: -1 });

        // Generate employee ID
        let employeeId = "EMP000001";

        if (lastEmployee?.employeeId) {
            const lastNumber = parseInt(
                lastEmployee.employeeId.replace("EMP", ""),
                10
            );
            employeeId = `EMP${String(lastNumber + 1).padStart(6, "0")}`;
        }

        const employee = new EmployeeList({
            employeeId,
            name,
            email,
            phone,
            dob,
            department,
            isActive: true
        });

        await employee.save();
        await sendEmployeeCreatedEmail(employee);
        return res.status(201).json({
            message: "Employee Created",
            data: {
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email
            }
        });

    } catch (error) {
        console.error("Create Employee Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};




export const updateEmployee = async (req, res) => {
    try {
        const { name, email, phone, dob, department, isActive } = req.body
        const user = await EmployeeList.findByIdAndUpdate(req.params.idUser, { name, email, phone, dob, department, isActive });
        await user.save();
        return res.status(201).json({ message: 'Employee list updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




export const getEmployees = async (req, res) => {
    try {
        const users = await EmployeeList.find();

        res.status(200).json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get employees"
        });
    }
};

export const toggleEmployeeStatus = async (req, res) => {
    try {
        const { idUser } = req.params;
        const employee = await EmployeeList.findById(idUser);
        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }
        employee.isActive = !employee.isActive;
        await employee.save();
        return res.status(200).json({
            message: employee.isActive
                ? 'Employee activated successfully'
                : 'Employee deactivated successfully',
            data: employee
        });
    } catch (error) {
        console.error('Toggle employee status error:', error);
        return res.status(500).json({
            message: 'Failed to update employee status'
        });
    }
};

export const searchEmployees = async (req, res) => {
    try {
        const { name, email, department, isActive } = req.body;
        let filter = {};
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }
        if (email) {
            filter.email = { $regex: email, $options: "i" };
        }
        if (department) {
            filter.department = { $regex: department, $options: "i" };
        }
        if (isActive !== undefined && isActive !== null) {
            filter.isActive = isActive;
        }
        const employees = await EmployeeList.find(filter);
        return res.status(200).json({
            message: 'Success',
            data: employees
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to search employees"
        });
    }
};

export const exportEmployeesExcel = async (req, res) => {

    try {

        const {
            name,
            email,
            department,
            isActive
        } = req.body;

        // =========================
        // FILTER
        // =========================

        const filter = {};

        if (name?.trim()) {
            filter.name = {
                $regex: name.trim(),
                $options: "i"
            };
        }

        if (email?.trim()) {
            filter.email = {
                $regex: email.trim(),
                $options: "i"
            };
        }

        if (department?.trim()) {
            filter.department = {
                $regex: department.trim(),
                $options: "i"
            };
        }

        if (isActive !== null && isActive !== undefined) {
            filter.isActive = isActive;
        }

        // =========================
        // GET DATA
        // =========================

        const employees = await EmployeeList
            .find(filter)
            .sort({ createdAt: -1 })
            .lean();

        // =========================
        // COLUMNS
        // =========================

        const columns = [
            {
                header: "S.No",
                key: "sno",
                width: 8
            },
            {
                header: "Employee Name",
                key: "name",
                width: 25
            },
            {
                header: "Email",
                key: "email",
                width: 30
            },
            {
                header: "Department",
                key: "department",
                width: 20
            },
            {
                header: "Phone",
                key: "phone",
                width: 18
            },
            {
                header: "Status",
                key: "status",
                width: 15
            }
        ];

        // =========================
        // ROWS
        // =========================

        const rows = employees.map((employee, index) => [

            index + 1,

            employee.name || "",

            employee.email || "",

            employee.department || "",

            employee.phone || "",

            employee.isActive
                ? "Active"
                : "Inactive"

        ]);

        // =========================
        // CREATE EXCEL
        // =========================

        const workbook = await createExcelFile({

            sheetName: "Employees",

            title: "Employee List",

            columns,

            rows,

            generatedBy: "Dinesh Kumar"

        });

        // =========================
        // DOWNLOAD
        // =========================

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="Employee_List.xlsx"'
        );

        return res.status(200).send(Buffer.from(buffer));

    } catch (error) {

        console.error("Excel error:", error);

        return res.status(500).json({
            success: false,
            message: "Excel export failed"
        });
    }
};

export const exportEmployeesPDF = async (req, res) => {

    try {

        const {
            name,
            email,
            department,
            isActive
        } = req.body;

        // =========================
        // FILTER
        // =========================

        const filter = {};

        if (name?.trim()) {
            filter.name = {
                $regex: name.trim(),
                $options: "i"
            };
        }

        if (email?.trim()) {
            filter.email = {
                $regex: email.trim(),
                $options: "i"
            };
        }

        if (department?.trim()) {
            filter.department = {
                $regex: department.trim(),
                $options: "i"
            };
        }

        if (
            isActive !== null &&
            isActive !== undefined
        ) {
            filter.isActive = isActive;
        }

        // =========================
        // GET EMPLOYEES
        // =========================

        const employees = await EmployeeList
            .find(filter)
            .sort({ createdAt: -1 })
            .lean();

        // =========================
        // PDF HEADERS
        // =========================

        const headers = [
            "S.No",
            "Employee Name",
            "Email",
            "Department",
            "Phone",
            "Status"
        ];

        // =========================
        // COLUMN WIDTHS
        // =========================

        const columnWidths = [
            40,
            145,
            210,
            145,
            120,
            95
        ];

        // =========================
        // PDF ROWS
        // =========================

        const rows = employees.map(
            (employee, index) => [

                index + 1,

                employee.name || "-",

                employee.email || "-",

                employee.department || "-",

                employee.phone || "-",

                employee.isActive
                    ? "Active"
                    : "Inactive"

            ]
        );

        // =========================
        // COMMON PDF EXPORT
        // =========================

        return exportPDF({

            res,

            title: "Employee List",

            fileName: "Employee_List.pdf",

            headers,

            columnWidths,

            rows,

            generatedBy: "Dinesh Kumar"

        });

    } catch (error) {

        console.error(
            "PDF export error:",
            error
        );

        if (!res.headersSent) {

            return res.status(500).json({
                success: false,
                message: "Failed to export employees"
            });
        }
    }
};



export const employeeDelete = async (req, res) => {
    try {
        const { idUser } = req.params;

        const department = await EmployeeList.findByIdAndDelete(idUser);

        if (!department) {
            return res.status(404).json({
                message: 'Department not found'
            });
        }

        return res.status(200).json({
            message: 'Department deleted successfully',
            data: department
        });

    } catch (error) {
        console.error('Delete Department error:', error);

        return res.status(500).json({
            message: 'Failed to delete department'
        });
    }
};