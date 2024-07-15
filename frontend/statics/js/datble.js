document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
    var preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
    
    var content = document.getElementById('content');
    content.style.display = 'block';
    
    document.body.style.overflow = 'auto';
}, 3000);  
});
$("#searchInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#staffTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});

// Pagination
const rowsPerPage = 5;
const rows = $("#staffTable tr");
const rowsCount = rows.length;
const pageCount = Math.ceil(rowsCount / rowsPerPage);
const pagination = $("#pagination");

for (let i = 1; i <= pageCount; i++) {
    pagination.append(`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`);
}

pagination.find("li:first-child").addClass("active");
showPage(1);

pagination.on("click", "li", function(e) {
    e.preventDefault();
    pagination.find("li").removeClass("active");
    $(this).addClass("active");
    showPage(parseInt($(this).text()));
});

function showPage(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    rows.hide();
    rows.slice(start, end).show();
}