$(function () {
  if ($("textarea#ta").length) {
    ClassicEditor.create(document.querySelector("#ta")).catch((error) => {
      console.error(error);
    });
  }

  $("a.confirmDeletion").on("click", function () {
    if (!confirm("Confirm deletion")) return false;
  });
});
