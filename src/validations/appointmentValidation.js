import Joi from "joi";

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required();

export const createAppointmentSchema = Joi.object({
    serviceId: objectId,

    staffId: objectId,

    appointmentDate: Joi.date()
        .required(),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .allow(""),

    notes: Joi.string()
        .max(500)
        .allow("")
});