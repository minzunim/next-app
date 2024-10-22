export const getCurrentDate = () => {

    let date = new Date();
    let offset = date.getTimezoneOffset() * 60000; // ms단위

    let today = new Date(date.getTime() - offset);

    return today;
};
