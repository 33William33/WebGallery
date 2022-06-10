//closure of index
let index = (function () {
  "use strict";
  window.addEventListener("load", function () {
    //create images from input
    function createImage(title, url, author) {
      let elmt = document.createElement("div");
      elmt.className = "img-format";
      elmt.innerHTML = `<div class="img-element">
                          <div class="img-title">Title:${title}</div>
                          <div class= "control">
                          <div class="left-icon icon"></div>
                          <img class="img-picture" src="${url}">
                          <div class="right-icon icon"></div>
                          </div>
                          <div class="below">
                          <div class="img-username">Auther:${author}</div>
                          <div class="delete-icon icon"></div>
                          </div>
                          </div>`;
      return elmt;
    }

    //set the image to show empty
    function setEmptyImage() {
      let elmt = document.createElement("div");
      elmt.className = "img-format";
      elmt.innerHTML = `<div class="img-element">
                          <div class="img-title"></div>
                          <div class= "control">
                          <img class="img-picture" src="media/empty.png">
                          </div>
                          <div class = "below">
                          <div class="img-username"></div>
                          <div class="delete-icon icon"></div>
                          </div>
                          </div>`;
      return elmt;
    }

    //create the form of adding comments
    function createCmtForm() {
      let elmt = document.createElement("div");
      elmt.className = "cmt-form-format";
      elmt.innerHTML = `<form class="form" id="create-comm-form">
                          <button type="submit" class="btn">Add your comment</button>
                          <input
                            type="text"
                            id="cmt-name"
                            class="form-format"
                            placeholder="Enter your name"
                            name="cauthname"
                            required
                          />
                          <input
                            type="text"
                            id="cmt-content"
                            class="form-format"
                            name="content"
                            placeholder="Enter your comment"
                            required
                          />
                          </form>`;
      return elmt;
    }

    //create comments from input
    function createComment(author, content, time) {
      let elmt = document.createElement("div");
      elmt.className = "cmt";
      elmt.innerHTML = `<div class="cmt-author">${author}:</div>
                          <div class="cmt-content">${content}</div>
                          <div class="time-below">
                          <div class="cmt-time">${time}</div>
                          <div class="delete-cmt icon"></div>
                          </div>`;
      return elmt;
    }

    //update image part
    function updateImage(id) {
      let imgs = apiService.getImages();
      document.querySelector("#display").innerHTML = "";
      imgs.forEach(function (img) {
        if (img.imageId === id) {
          apiService.setImageId(id);
          let elmt = createImage(img.title, img.url, img.author);
          document.querySelector("#display").prepend(elmt);
          //update when click left
          elmt
            .querySelector(".left-icon")
            .addEventListener("click", function (e) {
              if (apiService.prevImage(id)) {
                updateImage(id - 1);
                updateComments(apiService.getImageId(), 0);
              }
            });
          //update when click right
          elmt
            .querySelector(".right-icon")
            .addEventListener("click", function (e) {
              if (apiService.nextImage(id)) {
                updateImage(id + 1);
                updateComments(apiService.getImageId(), 0);
              }
            });
          //update after delete with situations
          elmt
            .querySelector(".delete-icon")
            .addEventListener("click", function (e) {
              apiService.deleteImage(id);
              if (apiService.nextImage(id - 1)) {
                updateImage(id);
                updateComments(apiService.getImageId(), 0);
              } else if (apiService.prevImage(id)) {
                updateImage(id - 1);
                updateComments(apiService.getImageId(), 0);
              } else {
                let emp = setEmptyImage();
                updateImage(apiService.getImageId());
                document.querySelector("#display").prepend(emp);
                updateCommentForm(apiService.getImageId());
                updateComments(apiService.getImageId(), 0);
              }
            });
          document.querySelector("#display").prepend(elmt);
        }
      });
    }

    //update comment part
    function updateComments(id, page) {
      document.querySelector("#comments").innerHTML = "";
      if (apiService.nextPage(id, page - 1)) {
        apiService.setPage(page);
        if (apiService.nextImage(id - 1)) {
          let control = document.createElement("div");
          control.className = "cmt-control";
          control.innerHTML = `<div class="left-cmt icon"></div>
                            <div class="right-cmt icon"></div>`;
          document.getElementById("comments").prepend(control);
          apiService.getCmtList(id, page).forEach(function (cmt) {
            let elmt = createComment(cmt.author, cmt.content, cmt.date);
            document.querySelector("#comments").prepend(elmt);

            elmt
              .querySelector(".delete-cmt")
              .addEventListener("click", function (e) {
                let commentId = cmt.id;
                apiService.deleteComment(commentId);
                updateComments(id, 0);
              });
            document.querySelector("#comments").prepend(elmt);
          });
          //show previous page when click
          control
            .querySelector(".left-cmt")
            .addEventListener("click", function (e) {
              if (apiService.prevPage(id, page)) {
                updateComments(id, page - 1);
              }
            });
          //show next page when click
          control
            .querySelector(".right-cmt")
            .addEventListener("click", function (e) {
              if (apiService.nextPage(id, page)) {
                updateComments(id, page + 1);
              }
            });
        }
      }
    }

    //update decide to show comment form or not
    function updateCommentForm(id) {
      if (apiService.nextImage(id - 1)) {
        let elmt = createCmtForm();
        document.querySelector("#comt-form").prepend(elmt);
      } else {
        document.querySelector("#comt-form").remove();
      }
    }

    // toggle button to change format
    document.getElementById("check").addEventListener("click", function (e) {
      let check = document.getElementById("check");
      let elmt = document.getElementById("create-add-form");
      if (check.checked) {
        elmt.style.display = "none";
      } else {
        elmt.style.display = "flex";
      }
    });

    //update image and comment when click add
    document
      .getElementById("create-add-form")
      .addEventListener("submit", function (e) {
        let title = document.getElementById("image-title").value;
        let author = document.getElementById("author-name").value;
        let url = document.getElementById("image-address").value;
        let id = apiService.addImage(title, author, url);
        document.getElementById("create-add-form").reset();
        let elmt = createImage(title, url, author);
        document.getElementById("display").prepend(elmt);
        updateImage(id);
      });
    updateImage(apiService.getImageId());
    updateCommentForm(apiService.getImageId());
    //update comments when click add new comment
    let elem = document.querySelector("#create-comm-form");
    if (elem !== null) {
      document
        .getElementById("create-comm-form")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          let author = document.getElementById("cmt-name").value;
          let content = document.getElementById("cmt-content").value;
          apiService.addComment(apiService.getImageId(), author, content);
          document.getElementById("create-comm-form").reset();
          let control = document.createElement("div");
          control.className = "cmt-control";
          control.innerHTML = `<div class="left-cmt icon"></div>
                            <div class="right-cmt icon"></div>`;
          document.getElementById("comments").prepend(control);
          let elmt = createComment(author, content, new Date());
          document.getElementById("comments").prepend(elmt);
          updateImage(apiService.getImageId());
          updateComments(apiService.getImageId(), 0);
        });
    }
    updateImage(apiService.getImageId());
    updateComments(apiService.getImageId(), apiService.getPage());
  });
})();
