const BASE_URL = "https://fancy-todo-phase2.herokuapp.com/todos";
const $login = $("#login");
const $register = $("#register");
const $home = $("#home");
const $list = $("#list-table");
const $edit = $("#edit");
const $navbar = $("#navbar");
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: toast => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

if (localStorage.getItem("token")) {
  todo();
} else {
  login();
}

// PAGE LOGIN
function login() {
  $login.show();
  $register.hide();
  $home.hide();
  $edit.hide();
  $navbar.hide();
}

// PAGE REGISTER
function register() {
  $login.hide();
  $register.show();
  $home.hide();
  $edit.hide();
  $navbar.hide();
}

// HOME PAGE SETELAH LOGIN
function todo() {
  $login.hide();
  $register.hide();
  $edit.hide();
  $("#add-todo")[0].reset();
  $.ajax({
    type: "GET",
    url: BASE_URL,
    headers: {
      token: localStorage.getItem("token")
    }
  }).done(data => {
    $list.empty();
    let counter = 1;
    data.forEach(element => {
      $list.append(`
      <tr>
      <td>${counter}</td>
      <td>${element.title}</td>
      <td>${element.description}</td>
      <td><span class="delete" style="color: orange;" onclick="editStatus(${element.id})" id="delete">${element.status}</span></td>
      <td>${element.due_date}</td>
      <td style="text-align: center;" >
      <span href="" class="delete" style="color: orange;" onclick="todoEdit(${element.id})" data-toggle="modal" data-target="#modalContactForm" id="delete">Edit</span>
       |
      <span  class="delete" style="color: orange;" onclick="todoDelete(${element.id})" id="delete">Delete</span>
      </td>
    </tr>`);
      counter++;
    });
    $navbar.show();
    $("#profile").text(localStorage.getItem("fullname"));
    $home.show();
  });
}

// EDIT STATUS
function editStatus(id) {
  $.ajax({
    type: "GET",
    url: BASE_URL + "/" + id,
    headers: {
      token: localStorage.getItem("token")
    }
  }).done(response => {
    let status;
    if (response.status === "incomplete") {
      status = "complete";
    } else {
      status = "incomplete";
    }
    let inputData = { status };
    $.ajax({
      type: "PUT",
      url: BASE_URL + "/" + id,
      data: inputData,
      headers: {
        token: localStorage.getItem("token")
      }
    }).done(res => {
      todo();
    });
  });
}

// DELETE TODO
function todoDelete(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(result => {
    if (result.value) {
      $.ajax({
        type: "DELETE",
        url: BASE_URL + "/" + id,
        headers: {
          token: localStorage.getItem("token")
        },
        success: function(response) {
          todo();
          Toast.fire({
            icon: "success",
            title: "Your todo has been deleted."
          });
        }
      });
    }
  });
}

// FITUR EDIT TODO
function todoEdit(id) {
  $.ajax({
    type: "GET",
    url: BASE_URL + "/" + id,
    headers: {
      token: localStorage.getItem("token")
    }
  }).done(response => {
    $("#title-edit").val(response.title);
    $("#description-edit").val(response.description);
    $("#date-edit").val(response.due_date);
    $("#edit-todo").on("submit", function(e) {
      e.preventDefault();
      let title = $("#title-edit").val();
      let description = $("#description-edit").val();
      let due_date = $("#date-edit").val();
      let inputData = { title, description, due_date };
      $.ajax({
        type: "PUT",
        url: BASE_URL + "/" + id,
        data: inputData,
        headers: {
          token: localStorage.getItem("token")
        }
      }).done(() => {
        $("#edit-todo")[0].reset();
        $("#modalContactForm").modal("toggle");
        todo();
      });
    });
  });
}

// FITUR HOME
$("#sign-up").on("click", function(e) {
  e.preventDefault();
  register();
});

$("#sign-in").on("click", function(e) {
  e.preventDefault();
  $("#form-register")[0].reset();
  login();
});

$("#cancel-edit").on("click", function(e) {
  e.preventDefault();
  todo();
});

// SIGN IN NORMAL
$("#form-sign-in").on("submit", function(e) {
  e.preventDefault();
  let username = $("#username").val();
  let password = $("#password").val();
  let userData = { username, password };
  $.ajax({
    type: "POST",
    url: "https://fancy-todo-phase2.herokuapp.com/user/login",
    data: userData
  })
    .done(response => {
      localStorage.setItem("token", response.token);
      localStorage.setItem("fullname", response.fullname);
      Toast.fire({
        icon: "success",
        title: `Welcome Back, ${username}`
      });
      todo();
    })
    .fail(err => {
      Swal.fire({
        icon: "error",
        title: "Invalid Username / Password."
      });
    });
});

// GOOGLE SIGN IN
function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  $.ajax({
    type: "POST",
    url: "https://fancy-todo-phase2.herokuapp.com/user/google",
    data: { id_token }
  })
    .done(response => {
      localStorage.setItem("token", response.token);
      localStorage.setItem("fullname", response.fullname);
      console.log(response)
      Toast.fire({
        icon: "success",
        title: "Signed in successfully"
      });
      todo();
    })
    .fail(err => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!"
      });
    });
}

// GOOGLE SIGN OUT
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    localStorage.clear();
    login();
  });
}

// REGISTER USER
$("#form-register").on("submit", function(e) {
  e.preventDefault();
  let fullname = $("#fullname-register").val();
  let username = $("#username-register").val();
  let email = $("#email-register").val();
  let password = $("#password-register").val();
  let inputData = {
    fullname,
    username,
    email,
    password
  };
  $.ajax({
    type: "POST",
    url: "https://fancy-todo-phase2.herokuapp.com/user/register",
    data: inputData
  })
    .done(response => {
      login();
      $("#form-register")[0].reset();
    })
    .fail(err => {
      if (err.responseJSON.errors[0].message === "email must be unique") {
        Swal.fire({
          icon: "error",
          title: "Email has already registered."
        });
      } else if (err.status === 500) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Internal server went wrong!"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Please fill out all the form."
        });
      }
    });
});

// ADD TODO
$("#add-todo").on("submit", function(e) {
  e.preventDefault();
  let title = $("#title").val();
  let description = $("#description").val();
  let status = $("#status").val();
  let due_date = $("#due_date").val();
  let inputData = { title, description, status, due_date };
  $.ajax({
    type: "POST",
    url: BASE_URL,
    data: inputData,
    headers: {
      token: localStorage.getItem("token")
    }
  })
    .done(response => {
      $("#add-todo")[0].reset();
      $("#exampleModal").modal("toggle");
      todo();
    })
    .fail(err => {
      let message = [];
      err.responseJSON.errors.forEach(i => {
        message.push(i.message);
      });
      if (message.length > 1) {
        Swal.fire({
          icon: "error",
          title: "Please fill out all the form."
        });
      } else {
        Swal.fire({
          icon: "error",
          title: message
        });
      }
    });
});
