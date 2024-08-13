import dayjs from "dayjs";

// 获取Boss直聘的职位列表数据并更新UI
export async function getBossJobListData(responseText) {
  try {
    const data = JSON.parse(responseText);
    const jobList = data?.zpData?.jobList || [];

    if (jobList.length > 0) {
      const jobListContainer = await waitUntilJobListRendered();
      updateJobListItemsWithTime(jobList, jobListContainer);
    }
  } catch (err) {
    console.error("Failed to process job list data:", err);
  }
}

// 等待职位列表容器加载完成
function waitUntilJobListRendered() {
  return new Promise((resolve, reject) => {
    const jobResultContainer = document.querySelector(".search-job-result");
    if (!jobResultContainer) {
      return reject(new Error("Job list container not found"));
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.classList?.contains("job-list-box")) {
            observer.disconnect();
            resolve(node);
          }
        });
      }
    });

    observer.observe(jobResultContainer, { childList: true });
  });
}

// 更新职位列表项的最后修改时间标签
function updateJobListItemsWithTime(jobList, jobListContainer) {
  jobList.forEach((job) => {
    const listItem = jobListContainer.querySelector(`[ka="search_list_${job.itemId}"]`);
    if (listItem) {
      const lastModifyTimeTag = createLastModifyTimeTag(job.lastModifyTime);
      listItem.appendChild(lastModifyTimeTag);
    }
  });
}

// 创建包含最后修改时间的标签，并设置背景色
function createLastModifyTimeTag(timeStamp) {
  const timeTag = document.createElement("div");
  timeTag.classList.add("boosLastTime");

  const now = dayjs();
  const modifyTime = dayjs(timeStamp);
  const differenceInDays = now.diff(modifyTime, "day");
  const dayPassed = differenceInDays;

  // 设置背景色基于时间差
  timeTag.style.background = getBackgroundColor(differenceInDays);

  const timeString = modifyTime.format("YYYY-MM-DD HH:mm:ss");
  timeTag.textContent = `${timeString} (已过去${dayPassed}天)`;

  return timeTag;
}

// 根据天数差异返回相应的背景色
function getBackgroundColor(differenceInDays) {
  if (differenceInDays <= 14) {
    return "rgb(4, 197, 165)"; // 绿色，距今两周内
  } else if (differenceInDays <= 45) {
    return "#F0AD4E"; // 暗橙色，两周到一个半月
  } else {
    return "red"; // 红色，超过一个半月
  }
}
