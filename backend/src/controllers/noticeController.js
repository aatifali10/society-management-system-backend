import Notice from "../models/Notice";

export const getNotices = async (req, res) => {
  try {
    const { type, category, isPublished, startDate, endDate } = req.query;

    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const user = req.user;
    query.$or = [
      { "targetAudience.towers": { $in: [user.tower] } },
      { "targetAudience.towers": { $exists: false } },
      { "targetAudience.towers": { $size: 0 } },
    ];

    const notices = await Notice.find(query)
      .populate("author", "name email")
      .populate("readBy.user", "name email")
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("author", "name email")
      .populate("readBy.user", "name email");

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    notice.views += 1;
    await notice.save();

    const alreadyRead = notice.readBy.some(
      (read) => read.user._id.toString() === req.user.id,
    );

    if (!alreadyRead) {
      notice.readBy.push({
        user: req.user.id,
        readAt: new Date(),
      });
      await notice.save();
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      category,
      priority,
      attachments,
      targetAudience,
      expiryDate,
      isPinned,
    } = req.body;

    const notice = await Notice.create({
      title,
      content,
      type,
      category,
      priority: priority || "medium",
      author: req.user.id,
      attachments: attachments || [],
      targetAudience: targetAudience || {},
      expiryDate: expiryDate || null,
      isPinned: isPinned || false,
    });

    res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const publishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    notice.isPublished = true;
    notice.publishedDate = new Date();
    await notice.save();

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unpublishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    notice.isPublished = false;
    await notice.save();

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNoticeStats = async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const publishedNotices = await Notice.countDocuments({ isPublished: true });
    const pinnedNotices = await Notice.countDocuments({ isPinned: true });

    const noticesByType = await Notice.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalNotices,
        publishedNotices,
        pinnedNotices,
        noticesByType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
