const AppError = require("../utils/AppError");
const DateUtil = require("../utils/DateUtil");
const hasValue = require("../utils/hasValue");
const Pagination = require("../utils/Pagination");
const tryCatch = require("../utils/tryCatch");

const db = require("../models");
const { where, Op } = require("sequelize");
const { getPaymentStatus } = require("../utils/commonUtils");
const {
  processImages,
  deleteImages,
  generateImageUrlsFromString,
} = require("../middlewares/uploadMiddleware");

const Jobs = db.jobs;
const acVariation = db.ac_variations;
const User = db.users;
const AddPayment = db.add_payment;
const jobVariation = db.jobs_variations;

const listJobs = tryCatch(async function (req, res, next) {
  const pagination = Pagination.build(req.body);
  const { search, payment_status } = req.body || {};

  let paymentFilter = {};

  if (payment_status === "Received") {
    paymentFilter = {
      payment_status: {
        [Op.in]: ["Paid", "Partially Paid"],
      },
    };
  } else if (payment_status === "Partially Pending") {
    paymentFilter = {
      payment_status: {
        [Op.in]: ["Partially Paid", "Pending"],
      },
    };
  } else if (payment_status) {
    paymentFilter = {
      payment_status: payment_status,
    };
  }

  const jobs = await Jobs.findAndCountAll({
    distinct: true,
    col: "id",
    where: {
      ...(search && {
        name: {
          [Op.like]: `%${search}%`,
        },
      }),
      ...paymentFilter,
    },
    include: [
      {
        model: acVariation,
        as: "ac_variations",
        required: false,
        attributes: {
          exclude: ["deleted_at"],
        },
      },
    ],
    order: [["id", "DESC"]],
    ...(pagination.isPaginated && {
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    attributes: {
      exclude: ["deleted_at"],
    },
  });

  return res.status(200).json({
    success: true,
    message: "Job List Found",
    total_records: jobs.count,
    data: jobs.rows,
  });
});

const addJob = tryCatch(async function (req, res, next) {
  const {
    name,
    contact_no,
    address,
    city,
    state,
    pincode,
    ac_type,
    job_type,
    contract_period,
    service_number,
    service_type,
    date,
    price,
    remarks,
    id,
    ac_variation,
    technician_id,
  } = req.body;

  if (hasValue(id)) {
    const job = await Jobs.findByPk(id);
    if (!job) {
      throw new AppError("Job not found", 404);
    }
    await job.update({
      name: name || "",
      contact_no: contact_no || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      ac_type: ac_type || "",
      job_type: job_type || job.job_type,
      contract_period: contract_period || job.contract_period,
      service_type: service_type || "",
      date: date || job.date,
      price: price || "",
      remarks: remarks || "",
    });

    let variation = ac_variation;

    if (typeof variation === "string") {
      try {
        variation = JSON.parse(variation);
      } catch {
        variation = [];
      }
    }

    if (!Array.isArray(variation)) {
      variation = [];
    }

    if (variation.length > 0) {
      await acVariation.destroy({ where: { job_id: id } });

      const formatted = variation.map((item) => ({
        job_id: id,
        capacity: item.capacity || "",
        location: item.location || "",
        complains: item.complains || "",
      }));

      await acVariation.bulkCreate(formatted);
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
    });
  }

  // Add new job
  let technician = null;

  if (req.user.role_name === "Technician") {
    technician = req.user;
  } else {
    if (hasValue(technician_id)) {
      technician = await User.findOne({
        where: { id: technician_id, role_name: "Technician" },
      });

      if (!technician) {
        throw new AppError("Invalid Technician Id", 404);
      } else if (!technician.isActive) {
        throw new AppError("Technician is not active", 400);
      }
    }
  }

  const creatJob = await Jobs.create({
    name: name || "",
    contact_no: contact_no || "",
    address: address || "",
    city: city || "",
    state: state || "",
    pincode: pincode || "",
    ac_type: ac_type || "",
    job_type: job_type || "",
    contract_period: contract_period || "",
    service_type: service_type || "",
    date: date || "",
    price: price || "",
    remarks: remarks || "",
    assigned_to: technician?.id || 0,
    technician_name: technician?.username || "",
  });

  let variationData = ac_variation;

  if (typeof variationData === "string") {
    try {
      variationData = JSON.parse(variationData);
    } catch (err) {
      variationData = [];
    }
  }
  if (!Array.isArray(variationData)) {
    variationData = [];
  }
  if (variationData.length > 0) {
    const formattedData = variationData.map((item) => ({
      job_id: creatJob.id,
      capacity: item.capacity || "",
      location: item.location || "",
      complains: item.complains || "",
    }));

    await acVariation.bulkCreate(formattedData);
  }

  const NUMBER_OF_SERVICE_IN_YEAR = 3;
  let how_many_service = 0;
  let months_count = 0;

  function getDates(totalMonths, totalParts) {
    const startDate = new Date(date);

    if (isNaN(startDate)) {
      return "Invalid date";
    }

    let dates = [];

    const gap = totalMonths / (totalParts - 1);

    for (let i = 0; i < totalParts; i++) {
      let date = new Date(startDate);

      date.setMonth(date.getMonth() + gap * i);

      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  }

  if (job_type === "AMC Contract") {
    switch (contract_period) {
      case "1 Year":
        how_many_service = hasValue(service_number)
          ? service_number
          : NUMBER_OF_SERVICE_IN_YEAR * 1;
        months_count = 12;
        break;
      case "2 Year":
        how_many_service = hasValue(service_number)
          ? service_number
          : NUMBER_OF_SERVICE_IN_YEAR * 2 - 1;
        months_count = 24;
        break;
      case "3 Year":
        how_many_service = hasValue(service_number)
          ? service_number
          : NUMBER_OF_SERVICE_IN_YEAR * 3 - 2;
        months_count = 36;
        break;
      case "6 Month":
        how_many_service = hasValue(service_number) ? service_number : 2;
        break;
      default:
        how_many_service = 0;
        months_count = 0;
    }
    const jobvariationData = getDates(months_count, how_many_service).map(
      (date) => ({
        job_id: creatJob.id,
        start_date: date,
      }),
    );
    await jobVariation.bulkCreate(jobvariationData);
  }

  return res.status(200).json({
    success: true,
    message: "Job added successfully",
  });
});

const deletejob = tryCatch(async function (req, res, next) {
  const { id } = req.body;

  const job = await Jobs.findByPk(id);

  if (!job) {
    throw new AppError("Invalid Job Id", 404);
  }

  await acVariation.destroy({
    where: { job_id: id },
  });

  await job.destroy();

  return res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

const details = tryCatch(async function (req, res, next) {
  const { job_id } = req.body;

  const jobsDetils = await Jobs.findByPk(job_id, {
    include: [
      {
        model: AddPayment,
        as: "add_payment",
        required: false,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },{
        model:jobVariation,
        as:"jobs_variations",
        required:false,
      }
    ],
    attributes: {
      exclude: ["deleted_at"],
    },
  });
  if (!jobsDetils) {
    throw new AppError("Job details not found", 404);
  }

   let data = jobsDetils.toJSON();

   if(data.jobs_variations){
    data.jobs_variations = data.jobs_variations.map(item =>{
        return {
          ...item,
          start_job_image:generateImageUrlsFromString(req,item.start_job_image),
          end_job_image:generateImageUrlsFromString(req,item.end_job_image),
        }
    });
   }
  return res.status(200).json({
    success: true,
    message: "Job details found",
    data,
  });
});

const jobTransfer = tryCatch(async function (req, res, next) {
  const { job_id, technician_id } = req.body;

  const job = await Jobs.findByPk(job_id);

  if (!job) {
    throw new AppError("Invalid Job Id", 404);
  }

  const technician = await User.findOne({
    where: { id: technician_id, role_name: "Technician" },
  });

  if (!technician) {
    throw new AppError("Invalid Technician Id", 404);
  } else if (!technician.isActive) {
    throw new AppError("Technician is not active", 400);
  }

  await job.update({
    assigned_to: technician_id || 0,
    technician_name: technician.username || "",
  });

  return res.status(200).json({
    success: true,
    message: "Job transferred successfully",
  });
});

const addPayment = tryCatch(async function (req, res, next) {
  const { job_id, amount, mode, remark, date } = req.body;

  const jobData = await Jobs.findByPk(job_id);

  if (!jobData) {
    throw new AppError("Invalid Job Id", 404);
  }

  const payment = await AddPayment.create({
    job_id: job_id,
    amount: amount,
    mode: mode || "",
    remark: remark || "",
    date: date || "",
  });

  const totalPaidAmount = await AddPayment.sum("amount", {
    where: { job_id },
  });

  const paymentStatus = getPaymentStatus(totalPaidAmount, jobData.price);

  await jobData.update({
    total_paid: totalPaidAmount,
    payment_status: paymentStatus,
  });

  return res.status(200).json({
    success: true,
    message: "Payment added successfully",
  });
});

const startJob = tryCatch(async function (req, res, next) {
  const { id, job_id, remark, start_date } = req.body;

  const jobVariationDetils = await jobVariation.findByPk(id);
  if (!jobVariationDetils) {
    throw new AppError("Invalid job request id", 404);
  }

  if (jobVariationDetils.job_id !== Number(job_id)) {
    throw new AppError("Invalide job id!", 404);
  }

  let oldImages = jobVariationDetils.start_job_image || [];
  let removedImages = [];

  if (oldImages) {
    removedImages = JSON.parse(oldImages);
    deleteImages(removedImages);
  }

  let imageName = [];
  if (req.files?.length) {
    imageName = await processImages(req.files, {
      width: 800,
      height: 800,
      quality: 70,
      format: "jpeg",
    });
  }

  await jobVariationDetils.update({
    status: "In Progress",
    remark: remark || "",
    start_date: DateUtil.parseDate(start_date),
    start_job_image: imageName,
  });

  return res.status(200).json({
    success: true,
    message: "Job start successfully",
  });
});

const endJob = tryCatch(async function (req, res, next) {
  const { id, job_id, end_remark, end_date, recived_payment } = req.body;

  const jobVariationDetils = await jobVariation.findByPk(id);
  if (!jobVariationDetils) {
    throw new AppError("Invalid job request id", 404);
  }

  if (jobVariationDetils.job_id !== Number(job_id)) {
    throw new AppError("Invalide job id!", 404);
  }

  let oldImages = jobVariationDetils.end_job_image || [];
  let removedImages = [];

  if (oldImages) {
    removedImages = JSON.parse(oldImages);
    deleteImages(removedImages);
  }

  let imageName = [];
  if (req.files?.length) {
    imageName = await processImages(req.files, {
      width: 800,
      height: 800,
      quality: 70,
      format: "jpeg",
    });
  }

  await jobVariationDetils.update({
    status: "Completed",
    recived_payment: recived_payment || "",
    end_remark: end_remark || "",
    end_date: DateUtil.parseDate(end_date),
    end_job_image: imageName,
  });

  return res.status(200).json({
    success: true,
    message: "Job end successfully",
  });
});
module.exports = {
  addJob,
  listJobs,
  deletejob,
  jobTransfer,
  addPayment,
  details,
  startJob,
  endJob
};
