export function getFormattedDate() {
  let today =  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Calcutta",
    }));
  return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
}
