Array.prototype.sortByPriority = function () {
  return this.sort((a, b) => {
    // Sort tasks based on priority (High -> Medium -> Low)
    if (a.priority === "High" && b.priority !== "High") return -1;
    if (a.priority !== "High" && b.priority === "High") return 1;
    if (a.priority === "Medium" && b.priority !== "Medium") return -1;
    if (a.priority !== "Medium" && b.priority === "Medium") return 1;
    // If priorities are the same, preserve original index order
    return this.indexOf(a) - this.indexOf(b);
  });
};
