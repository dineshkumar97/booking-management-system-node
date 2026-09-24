import Service from "../models/serviceModel.js";

export const createService = async  (req, res, next) => {
  try {

    const {
      name,
      description,
      duration,
      price
    } = req.body;

    // Validation
    if (
      !name ||
      !description ||
      !duration ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Name, description, duration and price are required"
      });
    }

    // Check duplicate service
    const existingService = await Service.findOne({
      name: name.trim()
    });

    if (existingService) {
      return res.status(409).json({
        message: "Service already exists"
      });
    }

    // Create service
    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      duration,
      price,
      status: "ACTIVE"
    });

    return res.status(201).json({
      message: "Service created successfully",
     data: service
    });

  } catch (error) {
 next(error);
  }
};

// GET ALL SERVICES
export const getServices = async  (req, res, next) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Services fetched successfully",
      data:  services
    });

  } catch (error) {
    next(error);
  }
};


// GET SERVICE BY ID
export const getServiceById = async  (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    return res.status(200).json({
      message: "Service fetched successfully",
  data:service
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE SERVICE
export const updateService = async  (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      duration,
      price
    } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      duration === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Name, description, duration and price are required"
      });
    }

    if (Number(duration) <= 0) {
      return res.status(400).json({
        message: "Duration must be greater than 0"
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative"
      });
    }

    const existingService = await Service.findOne({
      name: name.trim(),
      _id: { $ne: id }
    });

    if (existingService) {
      return res.status(409).json({
        message: "Service already exists"
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        duration: Number(duration),
        price: Number(price)
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    return res.status(200).json({
      message: "Service updated successfully",
      data:  service
    });

  } catch (error) {
    next(error);
  }
};


// DELETE SERVICE
export const deleteService = async  (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    return res.status(200).json({
      message: "Service deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};