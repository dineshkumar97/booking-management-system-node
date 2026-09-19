import DepartmentList from "../models/departmentModels.js";

export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        const existingDepartment = await DepartmentList.findOne({ name });
        if (!existingDepartment) {
            const department = new DepartmentList({ name,isActive: true });
            await department.save();
            return res.status(201).json({ message: 'Department Created' });
        }
        res.status(409).json({ message: 'Department Already Exists' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { name, isActive } = req.body
        const department = await DepartmentList.findByIdAndUpdate(req.params.idDepartment, { name, isActive });
        await department.save();
        return res.status(201).json({ message: 'Department list updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




export const getDepartments = async (req, res) => {
    try {
        const department = await DepartmentList.find();

        res.status(200).json(department);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get department"
        });
    }
};

export const toggleDepartmentStatus = async (req, res) => {
    try {
        const { idDepartment } = req.params;
        const department = await DepartmentList.findById(idDepartment);
        if (!department) {
            return res.status(404).json({
                message: 'Department not found'
            });
        }
        department.isActive = !department.isActive;
        await department.save();
        return res.status(200).json({
            message: department.isActive
                ? 'Department activated successfully'
                : 'Department deactivated successfully',
            data: department
        });
    } catch (error) {
        console.error('Toggle Department status error:', error);
        return res.status(500).json({
            message: 'Failed to update Department status'
        });
    }
};


export const deleteDepartment = async (req, res) => {
    try {
        const { idDepartment } = req.params;

        const department = await DepartmentList.findByIdAndDelete(idDepartment);

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