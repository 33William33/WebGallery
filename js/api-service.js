let apiService = (function () {
  let module = {};

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */
  //add local storage
  if (!localStorage.getItem("imgStorage")) {
    localStorage.setItem("imgStorage", JSON.stringify({ next: 0, imgs: [] }));
  }
  if (!localStorage.getItem("cmtStorage")) {
    localStorage.setItem("cmtStorage", JSON.stringify({ next: 0, cmts: [] }));
  }
  if (!localStorage.getItem("id")) {
    localStorage.setItem("id", JSON.stringify(0));
  }
  if (!localStorage.getItem("page")) {
    localStorage.setItem("page", JSON.stringify(0));
  }

  // add an image to the gallery
  module.addImage = function (title, author, url) {
    let imgStorage = JSON.parse(localStorage.getItem("imgStorage"));
    let img = {
      imageId: imgStorage.next++,
      title: title,
      author: author,
      url: url,
      date: new Date(),
    };
    imgStorage.imgs.push(img);
    localStorage.setItem("imgStorage", JSON.stringify(imgStorage));
    return img.imageId;
  };

  //tell if previous image is empty
  module.prevImage = function (imageId) {
    let imgs = this.getImages();
    let bool = false;
    imgs.forEach(function (img) {
      if (img.imageId === imageId - 1) {
        bool = true;
      }
    });
    return bool;
  };

  //tell if next image is empty
  module.nextImage = function (imageId) {
    let imgs = this.getImages();
    let bool = false;
    imgs.forEach(function (img) {
      if (img.imageId === imageId + 1) {
        bool = true;
      }
    });
    return bool;
  };
  // delete an image from the gallery given its imageId

  module.deleteImage = function (imageId) {
    //change all image ids of comments
    let cmtStorage = JSON.parse(localStorage.getItem("cmtStorage"));
    if (cmtStorage.cmts.length !== 0) {
      console.log(JSON.parse(localStorage.getItem("cmtStorage")).cmts);
      cmtStorage.cmts = this.spliceCmts(
        JSON.parse(localStorage.getItem("cmtStorage")).cmts,
        imageId,
        JSON.parse(localStorage.getItem("cmtStorage")).cmts
      );
      cmtStorage.cmts.forEach(function (cmt) {
        if (cmt.imageId > imageId) {
          cmt.imageId--;
        }
      });
      //delete comments
      localStorage.setItem("cmtStorage", JSON.stringify(cmtStorage));
    }
    //change image id
    let imgStorage = JSON.parse(localStorage.getItem("imgStorage"));
    let bool = false;
    let index = imgStorage.imgs.findIndex(function (img) {
      return img.imageId === imageId;
    });
    if (index !== -1) {
      imgStorage.imgs.forEach(function (img) {
        if (img.imageId === imageId) {
          bool = true;
        }
        if (bool) {
          img.imageId--;
        }
      });
      imgStorage.imgs.splice(index, 1);
      localStorage.setItem("imgStorage", JSON.stringify(imgStorage));
    }
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    let cmtStorage = JSON.parse(localStorage.getItem("cmtStorage"));
    let cmt = {
      imageId: imageId,
      id: cmtStorage.next++,
      author: author,
      content: content,
      date: new Date(),
    };
    cmtStorage.cmts.push(cmt);
    localStorage.setItem("cmtStorage", JSON.stringify(cmtStorage));
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    let cmtStorage = JSON.parse(localStorage.getItem("cmtStorage"));
    let index = cmtStorage.cmts.findIndex(function (cmt) {
      return cmt.id === commentId;
    });
    cmtStorage.cmts.splice(index, 1);
    localStorage.setItem("cmtStorage", JSON.stringify(cmtStorage));
  };

  //get the page list from comments
  module.getCmtList = function (id, page) {
    let cmts = this.getComments();
    let num = 0;
    let list = [];
    let revlist = [];
    cmts.forEach(function (cmt) {
      if (cmt.imageId === id) {
        list.unshift(cmt);
      }
    });
    list.forEach(function (cmt) {
      if (page * 10 <= num && num < page * 10 + 10) {
        revlist.unshift(cmt);
      }
      num++;
    });
    return revlist;
  };

  //get all images
  module.getImages = function () {
    let imgStorage = JSON.parse(localStorage.getItem("imgStorage"));
    return imgStorage.imgs;
  };

  //get all comments
  module.getComments = function () {
    let cmtStorage = JSON.parse(localStorage.getItem("cmtStorage"));
    return cmtStorage.cmts;
  };

  //get image id in storage
  module.getImageId = function () {
    let id = JSON.parse(localStorage.getItem("id"));
    return id;
  };

  //set image id to storage
  module.setImageId = function (id) {
    localStorage.setItem("id", JSON.stringify(id));
  };

  //get page in storage
  module.getPage = function () {
    let page = JSON.parse(localStorage.getItem("page"));
    return page;
  };

  //set page to storage
  module.setPage = function (page) {
    localStorage.setItem("page", JSON.stringify(page));
  };

  //tell if previous page is empty
  module.prevPage = function (id, page) {
    let cmts = this.getCmtList(id, page - 1);
    if (cmts.length === 0) {
      return false;
    }
    return true;
  };

  //tell if next page is empty
  module.nextPage = function (id, page) {
    let cmts = this.getCmtList(id, page + 1);
    if (cmts.length === 0) {
      return false;
    }
    return true;
  };

  //recursion to pass the comment list without removed images
  module.spliceCmts = function (cmts, compareId, list) {
    console.log(cmts);
    console.log(list);
    if (cmts.length === 0) {
      return list;
    }
    if (cmts[0].imageId === compareId) {
      let index = list.findIndex(function (cmt) {
        return cmt.id === cmts[0].id;
      });
      if (index !== -1) {
        list.splice(index, 1);
        return this.spliceCmts(cmts.slice(1), compareId, list);
      } else {
        return this.spliceCmts(cmts.slice(1), compareId, list);
      }
    } else {
      return this.spliceCmts(cmts.slice(1), compareId, list);
    }
  };

  return module;
})();
