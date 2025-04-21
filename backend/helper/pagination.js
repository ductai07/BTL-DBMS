module.exports = (page,count,limit) => {
    let objectPagination = {
        currentPage: 1,
        limitItems: limit
    };
    objectPagination.currentPage = parseInt(page);
    // tim index dau tien cua moi trang
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
    //dem so luong trang
    const totalPage = Math.ceil(count / objectPagination.limitItems)
    objectPagination.totalPage = totalPage
    
    return objectPagination
}