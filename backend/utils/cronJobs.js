// Cron Jobs Initialization
// This file contains scheduled tasks for the application

const cron = require("node-cron");
const Task = require("../models/Task");

/**
 * Generate next occurrence of a recurring task
 * @param {Object} parentTask - The parent recurring task
 */
const generateNextTaskOccurrence = async (parentTask) => {
  try {
    const {
      recurrencePattern,
      recurrenceEndDate,
      deadline,
      assignedTo,
      assignedBy,
      title,
      description,
      priority,
      department,
      tags,
    } = parentTask;

    // Check if we've reached the end date
    if (recurrenceEndDate && new Date() > recurrenceEndDate) {
      console.log(`⏸️ Recurrence ended for task: ${title}`);
      return null;
    }

    // Calculate next deadline based on recurrence pattern
    const currentDeadline = new Date(deadline);
    let nextDeadline = new Date(currentDeadline);

    if (recurrencePattern.frequency === "daily") {
      nextDeadline.setDate(
        nextDeadline.getDate() + (recurrencePattern.interval || 1),
      );
    } else if (recurrencePattern.frequency === "weekly") {
      nextDeadline.setDate(
        nextDeadline.getDate() + 7 * (recurrencePattern.interval || 1),
      );
    } else if (recurrencePattern.frequency === "biweekly") {
      nextDeadline.setDate(nextDeadline.getDate() + 14);
    } else if (recurrencePattern.frequency === "monthly") {
      nextDeadline.setMonth(
        nextDeadline.getMonth() + (recurrencePattern.interval || 1),
      );
      if (recurrencePattern.dayOfMonth) {
        nextDeadline.setDate(recurrencePattern.dayOfMonth);
      }
    }

    // Create new task instance
    const newTask = new Task({
      title: `${title} (Recurring)`,
      description,
      priority,
      status: "Pending",
      deadline: nextDeadline,
      assignedTo,
      assignedBy,
      department,
      tags,
      parentTaskId: parentTask._id,
      taskType: parentTask.taskType,
      isRecurring: false, // Instances are not recurring themselves
    });

    const savedTask = await newTask.save();

    // Update parent task's lastGeneratedDate and nextOccurrenceDate
    parentTask.lastGeneratedDate = new Date();
    parentTask.nextOccurrenceDate = nextDeadline;
    await parentTask.save();

    console.log(
      `✅ Generated new task occurrence: ${savedTask._id} for ${title}`,
    );
    return savedTask;
  } catch (error) {
    console.error("Error generating task occurrence:", error);
  }
};

/**
 * Check and generate recurring task instances
 * Runs every day at 2 AM
 * Also handles generation when child tasks are completed
 */
const generateRecurringTasks = async () => {
  try {
    console.log("🔄 Checking for recurring tasks to generate...");

    // OPTION 1: Generate based on time intervals (existing logic)
    // Find all parent recurring tasks
    const recurringTasks = await Task.find({
      isRecurring: true,
      taskType: { $ne: "One-time" },
      $or: [
        { recurrenceEndDate: { $gt: new Date() } },
        { recurrenceEndDate: { $exists: false } },
      ],
    }).populate("assignedTo assignedBy");

    console.log(`Found ${recurringTasks.length} recurring tasks`);

    for (const task of recurringTasks) {
      // Check if it's time to generate the next occurrence
      const lastGenerated = task.lastGeneratedDate || task.createdAt;
      const now = new Date();

      let shouldGenerate = false;

      if (task.recurrencePattern.frequency === "daily") {
        // Check if last generated was more than 1 day ago
        const daysDiff = Math.floor(
          (now - lastGenerated) / (1000 * 60 * 60 * 24),
        );
        shouldGenerate = daysDiff >= (task.recurrencePattern.interval || 1);
      } else if (task.recurrencePattern.frequency === "weekly") {
        const daysDiff = Math.floor(
          (now - lastGenerated) / (1000 * 60 * 60 * 24),
        );
        shouldGenerate = daysDiff >= 7 * (task.recurrencePattern.interval || 1);
      } else if (task.recurrencePattern.frequency === "biweekly") {
        const daysDiff = Math.floor(
          (now - lastGenerated) / (1000 * 60 * 60 * 24),
        );
        shouldGenerate = daysDiff >= 14;
      } else if (task.recurrencePattern.frequency === "monthly") {
        const monthsDiff =
          (now.getFullYear() - lastGenerated.getFullYear()) * 12 +
          (now.getMonth() - lastGenerated.getMonth());
        shouldGenerate = monthsDiff >= (task.recurrencePattern.interval || 1);
      }

      if (shouldGenerate) {
        await generateNextTaskOccurrence(task);
      }
    }

    // OPTION 2: Generate next instance when previous child task is completed
    console.log("🔄 Checking for completed child tasks...");
    const completedChildTasks = await Task.find({
      parentTaskId: { $exists: true, $ne: null },
      status: "Completed",
    }).populate("parentTaskId");

    console.log(`Found ${completedChildTasks.length} completed child tasks`);

    for (const childTask of completedChildTasks) {
      const parentTask = childTask.parentTaskId;

      // Check if parent is still recurring
      if (
        parentTask &&
        parentTask.isRecurring &&
        parentTask.taskType !== "One-time"
      ) {
        // Check if we haven't already generated the next instance
        // by verifying there's no pending/in-progress sibling with a future deadline
        const pendingSiblings = await Task.findOne({
          parentTaskId: parentTask._id,
          status: { $nin: ["Completed", "Cancelled"] },
        });

        if (!pendingSiblings) {
          // No active instances, generate the next one
          console.log(
            `⚡ Child task completed, generating next instance for parent: ${parentTask.title}`,
          );
          await generateNextTaskOccurrence(parentTask);
        }
      }
    }

    console.log("✨ Recurring task generation completed");
  } catch (error) {
    console.error("Error in recurring task generation:", error);
  }
};

const initCronJobs = () => {
  console.log("📅 Cron Jobs initialized");

  // Generate recurring tasks every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ Running recurring task generation...");
    await generateRecurringTasks();
  });

  // Alternative: Run every hour for development/testing
  // Uncomment below to test more frequently
  // cron.schedule("0 * * * *", async () => {
  //   console.log("⏰ Running recurring task generation (hourly test)...");
  //   await generateRecurringTasks();
  // });
};

module.exports = {
  initCronJobs,
  generateRecurringTasks,
  generateNextTaskOccurrence,
};
