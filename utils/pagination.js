function Pagination(currentPage, totalPages) {

    var nTotalPages = parseInt(totalPages);
    var nCurrentPage = parseInt(currentPage);

    this.totalPages = nTotalPages;
    if (totalPages == 1) {
        this.currentPage = this.previousPage = this.nextPage = 0;
    } else {
        this.currentPage = nCurrentPage;
        this.previousPage = nCurrentPage - 1;
        this.nextPage = nCurrentPage + 1;
    }
}

module.exports = Pagination;