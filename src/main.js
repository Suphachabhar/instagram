import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

/*
// This url may need to change depending on what port your backend is running
// on.
const api = new API('http://localhost:5000');

// Example usage of makeAPIRequest method.
api.makeAPIRequest('dummy/user')
    .then(r => console.log(r));
*/

const main = document.getElementById('main');
const alert = document.getElementById('alert');
const loginScreen = document.getElementById('loginScreen');
const nav = document.getElementById('nav');
var token = undefined;
var user_name = undefined;
let startTime = 0;

logIn();


// alert function on top on the page
// tell whether the action is success or fail
function alerts(string) {
    let alertbox = document.createElement('div');
    
    alertbox.innerText = string;
    alertbox.classList.add("alert");
    alertbox.classList.add("alert-info");
    alertbox.classList.add("alert-dismissible");
    alertbox.classList.add("fade");
    alertbox.classList.add("show");

    let closeAlert = document.createElement('button');
    closeAlert.classList.add("btn-close");
    
    closeAlert.onclick = ( () => {
        alertbox.remove();
    })

    alertbox.appendChild(closeAlert);
    alert.appendChild(alertbox);   
}

// calls this fucntion when they change the page
// e.g. login/signup -> change to feed page
function changePage(){
    while(main.firstChild){
        main.removeChild(main.lastChild);
    }

    // related to infinite scroll
    window.onscroll = function(){
        void 0;
    }
}

// Login function -> the first page user sees after running the website
function logIn(){

    // create the form
    let loginForm = document.createElement('form');

    let usernameLabel = document.createTextNode('Username');
    let username = document.createElement('input');
    username.setAttribute('type', 'text');

    let passwordLabel = document.createTextNode('Password');
    let password = document.createElement('input');
    password.setAttribute('type', 'password');

    let confirmPasswordLabel = document.createTextNode('Confirm password');
    let confirmPassword = document.createElement('input');
    confirmPassword.setAttribute('type', 'password');

    let loginButton = document.createElement('button');
    loginButton.innerText = "Login";
    loginButton.classList.add("btn");
    loginButton.classList.add("btn-outline-primary");

    loginForm.appendChild(usernameLabel);
    loginForm.appendChild(username);
    loginForm.appendChild(passwordLabel);
    loginForm.appendChild(password);
    loginForm.appendChild(confirmPasswordLabel);
    loginForm.appendChild(confirmPassword);
    loginForm.appendChild(loginButton);

    main.appendChild(loginForm);

    // linked to the signup page
    let registerButton = document.createElement('button');
    registerButton.innerText = "Register";
    registerButton.classList.add("btn");
    registerButton.classList.add("btn-outline-primary");
    registerButton.onclick = () => {
        changePage();
        signUp();
    };
    
    main.appendChild(registerButton);

    // after click login 
    //  -> check if any following posts new post
    //  -> profile button and create new post button appears
    loginForm.onsubmit = ( (event) => {
        event.preventDefault();
        const loginBody = {
            "username": username.value,
            "password": password.value,
        };

        if(password.value !== confirmPassword.value){
            alerts('Passwords don\'t match!')
        }else{
            const result = fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginBody),
            }).then( (data) => {
                if(data.status === 403){
                    alerts('Invalid Username/Password!')
                }else if(data.status === 400){
                    alerts('Missing Username/Password!')
                }else if (data.status === 200) {
                    data.json().then(result => {
                        token = result.token;
                        user_name = username.value;
                        console.log("kdkwmdkwmdkwm");
                        loadFeed(0,1,false);
                        start();
                        homeButton();
                        creatPost();
                    })
                }
            }).catch( (error) => {
                console.log('Error: ', error);
            })
        }
    })

}

// sign up fucntion - mostly similar to logIn()
function signUp(){
    
    let signUpForm = document.createElement('form');

    let usernameLabel = document.createTextNode('Username');
    let username = document.createElement('input');
    username.setAttribute('type', 'text');

    let passwordLabel = document.createTextNode('Password');
    let password = document.createElement('input');
    password.setAttribute('type', 'password');

    let confirmPasswordLabel = document.createTextNode('Confirm password');
    let confirmPassword = document.createElement('input');
    confirmPassword.setAttribute('type', 'password');

    let emailLabel = document.createTextNode('Email');
    let email = document.createElement('input');
    email.setAttribute('type', 'text');

    let nameLabel = document.createTextNode('Name');
    let name = document.createElement('input');
    name.setAttribute('type', 'text');

    let signUpButton = document.createElement('button');
    signUpButton.innerText = "Register";
    signUpButton.classList.add("btn");
    signUpButton.classList.add("btn-outline-primary");

    signUpForm.appendChild(usernameLabel);
    signUpForm.appendChild(username);
    signUpForm.appendChild(passwordLabel);
    signUpForm.appendChild(password);
    signUpForm.appendChild(confirmPasswordLabel);
    signUpForm.appendChild(confirmPassword);
    signUpForm.appendChild(emailLabel);
    signUpForm.appendChild(email);
    signUpForm.appendChild(nameLabel);
    signUpForm.appendChild(name);
    signUpForm.appendChild(signUpButton);

    main.appendChild(signUpForm);

    // after click signup 
    //  -> check if any following posts new post
    //  -> profile button and create new post button appears
    signUpForm.onsubmit = ( (event) => {
        event.preventDefault();
        const signUpBody = {
            "username": username.value,
            "password": password.value,
            "email": email.value,
            "name": name.value,
        };

        if(password.value !== confirmPassword.value){
            alerts('Passwords don\'t match!')
        }else{
            const result = fetch('http://localhost:5000/auth/signup', {
            method: 'POST',
            headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signUpBody),
            }).then( (data) => {
                if(data.status === 409){
                    alerts('Username Taken!')
                }else if(data.status === 400){
                    alerts('Missing Username/Password!')
                }else if (data.status === 200) {
                    data.json().then(result => {
                        token = result.token;
                        user_name = username.value;
                        loadFeed(0,1,false);
                        start();
                        homeButton();
                        creatPost();
                    })
                }
            }).catch( (error) => {
                console.log('Error: ', error);
            })
        }
    })
}

// links to push notification function 
//  -> check the current time
//  -> check the page every 1 second
function start() {
    startTime = Date.now()/ 1000;
    setInterval(function () {pushNotification(1);}, 1000);
}

// (2.6.3) push notification 
function pushNotification(n){
    const result = fetch('http://localhost:5000/user/feed?p=0&n=' + n, {
            method: 'GET',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            }, 
        }).then( (data) => {
            if(data.status === 403){
                alert('Invalid Auth Token!')
            }else if(data.status == 404){
                alert('User Not Found!')
            }else if (data.status === 200) {
                console.log(token);
                data.json().then(data => {
                    if (data.posts[0].meta.published > startTime) {
                        alerts(`${data.posts[0].meta.author} posts the new picture!`)
                    }
                    startTime = Date.now() / 1000;
                })
            }
        }).catch( (error) => {
            console.log('Error: ', error);
        })
}

// this function shows normal feed post 
//  -> name of person who posts the post
//  -> description of the post
//  -> image
//  -> number of like, people who like it
//  -> comment
//  -> (2.6.2) the live update
function post_box(post){

    const postBox = document.createElement('div');
    postBox.className = 'typical-box';

    //  -> name of person who posts the post
    const authorElement = document.createElement('button');
    authorElement.innerText = `${post.meta.author}`;
    authorElement.classList.add("btn");
    authorElement.classList.add("btn-secondary");
    authorElement.classList.add("btn-sm");

    authorElement.onclick =( (event) => {
        event.preventDefault();
        changePage();
        profileView(post.meta.author);
        
    })

    postBox.appendChild(authorElement);

    //  -> description of the post
    const dateElement = document.createElement('div');
    const datePublished = new Date(1000 * post.meta.published);
    dateElement.appendChild(document.createTextNode(datePublished.toLocaleString('en-AU')));
    postBox.appendChild(dateElement);

    //  -> image
    const imgElement = document.createElement('img');
    imgElement.setAttribute('src', `data:image/jpeg;base64, ${post.thumbnail}`);
    postBox.appendChild(imgElement);

    //  -> number of like, people who like it
    let likeElement = document.createElement('div');
    let countLike = post.meta.likes.length
    likeElement.textContent = `Like: ${countLike} `;

    let likeButton = document.createElement('button');
    likeButton.innerText = "❤️";
    likeButton.classList.add("btn");
    likeButton.classList.add("btn-outline-danger");
    likeElement.appendChild(likeButton);
    const postId = post.id;

    likeButton.addEventListener('click', () => {
        countLike++;

        likeElement.textContent = `Like: ${countLike} `;
        
        const result = fetch('http://localhost:5000/post/like?id=' + postId, {
        method: 'PUT',
        headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
        }).then( (data) => {
            if(data.status === 403){
                alerts('Invalid Auth Token!')
            }else if(data.status === 400){
                alerts('Malformed Request!')
            }else if(data.status === 404){
                alerts('Post Not Found!')
            }else if (data.status === 200) {
                alerts('you like the post!');
                const result = fetch('http://localhost:5000/post?id=' + postId, {
                method: 'GET',
                headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + token
                    },
                }).then( (data => {
                    if(data.status === 403){
                        alerts('Invalid Auth Token!')
                    }else if(data.status === 400){
                        alerts('Malformed Request!')
                    }else if(data.status === 404){
                        alerts('Post Not Found!')
                    }else if (data.status === 200) {
                        data.json().then( (data) => {
                            postBox.replaceWith(post_box(data));
                        })
                        
                    }
                }))

                
            }
        }).catch( (error) => {
            console.log('Error: ', error);
        })
    })



    if(post.meta.likes.length > 0){
        const likes = post.meta.likes;
        const likeBox = document.createElement('div');
        likeBox.className = 'typical-box';

        likes.map(like => {
            const authorLike = document.createElement('button');
           
            authorLike.classList.add("btn");
            authorLike.classList.add("btn-outline-danger");
            authorLike.classList.add("btn-sm");

            const nameAuthor = fetch('http://localhost:5000/user?id=' + like, {
                method: 'GET',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token,
                }, 
            }).then( (data) => {
                data.json().then(data => {
                    authorLike.innerText = `By ${data.username}`;
                    authorLike.onclick = ( (event) => {
                        event.preventDefault();
                        changePage();
                        profileView(data.username);
                    })
                })
            }).catch( (error) => {
                console.log('Error: ', error);
            })

            likeBox.appendChild(authorLike);
        })
        

        likeElement.appendChild(likeBox);
    }

    postBox.appendChild(likeElement);
    
    //  edit the description 
    const descElement = document.createElement('div');
    editDesc(descElement, false, post.meta.description_text, postId, post.meta.author);
    postBox.appendChild(descElement);


    //  -> comment
    const commentElement = document.createElement('div');
    commentElement.innerText = `Comment: ${post.comments.length}`;

    const comments = post.comments;
    const commentBox = document.createElement('div');
    commentBox.className = 'typical-box';

    comments.map(comment => {

        const authorComment = document.createElement('button');
        authorComment.innerText = `${comment.author}: ${comment.comment}`;

        authorComment.onclick = ( (event) => {
            event.preventDefault();
            changePage();
            profileView(comment.author);
        })
        commentBox.appendChild(authorComment);

    })
    commentElement.appendChild(commentBox);

    let commentForm = document.createElement('form');

    let addComment = document.createElement('input');
    addComment.setAttribute('type', 'text');
    commentForm.appendChild(addComment);

    let sendComment = document.createElement('button');
    sendComment.innerText = "send";
    sendComment.classList.add("btn");
    sendComment.classList.add("btn-primary");
    sendComment.classList.add("btn-sm");
    commentForm.appendChild(sendComment);

    commentForm.onsubmit = ( (event) => {
        event.preventDefault();

        const commentBody = {
            "comment": addComment.value,
        };

        const result = fetch('http://localhost:5000/post/comment?id=' + postId, {
        method: 'PUT',
        headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            body: JSON.stringify(commentBody),
        }).then( (data) => {
            if(data.status === 403){
                alerts('Invalid Auth Token!')
            }else if(data.status === 400){
                alerts('Malformed Request!')
            }else if(data.status === 404){
                alerts('Post Not Found!')
            }else if (data.status === 200) {
                alerts(`Add comment "${addComment.value}" successfully!`)
                const result = fetch('http://localhost:5000/post?id=' + postId, {
                method: 'GET',
                headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + token
                    },
                }).then( (data => {
                    if(data.status === 403){
                        alerts('Invalid Auth Token!')
                    }else if(data.status === 400){
                        alerts('Malformed Request!')
                    }else if(data.status === 404){
                        alerts('Post Not Found!')
                    }else if (data.status === 200) {
                        data.json().then( (data) => {
                            //  -> (2.6.2) the live update
                            postBox.replaceWith(post_box(data));
                        })
                        
                    }
                }))
                
            }
        }).catch( (error) => {
            console.log('Error: ', error);
        })       
    })
  

    commentBox.appendChild(commentForm);
    
    postBox.appendChild(commentElement);

    return postBox;
}

// edit the picture description 
//  -> check only user can edit their own description
function editDesc(element, editMode, desc, id, user){
    while (element.firstChild) {
        element.removeChild(element.lastChild)
    }
    //  -> check only user can edit their own description
    if(editMode && user_name === user){
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.value = desc;
        element.appendChild(input);

        let sendComment = document.createElement('button');
        sendComment.innerText = "send";
        sendComment.classList.add("btn");
        sendComment.classList.add("btn-primary");
        sendComment.classList.add("btn-sm");

        sendComment.onclick = ( () => {
            const createBody = {
                "description_text": input.value,
            };

            const result = fetch('http://localhost:5000/post?id=' + id, {
            method: 'PUT',
            headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token
                },
                body: JSON.stringify(createBody),
            }).then( (data) => {
                if(data.status === 403){
                    alerts('Invalid Auth Token / Unauthorized to edit Post!')
                }else if(data.status === 400){
                    alerts('Malformed Request!')
                }else if(data.status === 404){
                    alerts('Post Not Found!')
                }else if (data.status === 200) {
                    alerts('Change the description successfully!')
                    
                }
            }).catch( (error) => {
                console.log('Error: ', error);
            })
        })


        element.appendChild(sendComment);
    }else{
        
        element.appendChild(document.createTextNode(desc));

        if(user_name === user){
            const editButton = document.createElement('button');
            editButton.innerText = "Edit";
            editButton.classList.add("btn");
            editButton.classList.add("btn-primary");
            editButton.classList.add("btn-sm");
            element.appendChild(editButton);
            editButton.onclick = ( () => {
                editDesc(element, true, desc, id, user);
                
            })
        }
        
    }
}

// the feed page
// show only one post a time -> can check the infinite scroll in here
function loadFeed(p,n,checkScroll){
    const result = fetch('http://localhost:5000/user/feed?p=' + p + '&n=' + n, {
            method: 'GET',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            }, 
        }).then( (data) => {
            if(data.status === 403){
                alert('Invalid Auth Token!')
            }else if (data.status === 200) {
                console.log(token);
                data.json().then(data => {

                    const posts = data['posts'];
                    
                    if (posts.length > 0) {
                        if (!checkScroll) {
                            changePage();
        
                        }
                        
                        posts.map(post => {
    
                            main.appendChild(post_box(post)); 
                        })  
                        let nextButton = document.createElement('button');
                        nextButton.innerText = "next";
                        nextButton.classList.add("btn");
                        nextButton.classList.add("btn-outline-blue");
        
                        nextButton.onclick =( (event) => {
                            event.preventDefault();
                            loadFeed(p+n, n, false);
                        })
        
                        let previousButton = document.createElement('button');
                        previousButton.innerText = "previous";
                        previousButton.classList.add("btn");
                        previousButton.classList.add("btn-outline-blue");
        
                        previousButton.onclick =( (event) => {
                            event.preventDefault();
                            loadFeed(p-n, n, false);
                        })
    
                        main.appendChild(previousButton);
                        main.appendChild(nextButton);
                    
                        // implementing the infinite scroll
                        window.onscroll = function (){
                            const top = document.documentElement.scrollTop;
                            const totalHeight = document.documentElement.scrollHeight;
                            const clientHeight = document.documentElement.clientHeight;
                            if(top+clientHeight+5 >= totalHeight){
                                window.onscroll = function (){
                                    void 0;
                                }
                                loadFeed(p+n, n, true);
                                previousButton.remove();
                                nextButton.remove();
                            }
                        }
                    }else if(p == 0){
                        changePage();
                        let notImplementLabel = document.createTextNode('No post');
                        main.appendChild(notImplementLabel);
                    }
                })
                

            }
        }).catch( (error) => {
            console.log('Error: ', error);
        })
}

// profile view function 
//  -> user can click the button called "profile" on the right top corner to access their own profile
function profileView(user){
    const result = fetch('http://localhost:5000/user?username=' + user, {
            method: 'GET',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            }, 
        }).then( (data) => {
            if(data.status == 400){
                alerts("Malformed Request!");
            }else if(data.status == 403){
                alerts("Invalid Auth Token!");
            }else if(data.status == 404){
                alerts("User Not Found!");
            }else if(data.status == 200){
                data.json().then(data => {       
                    const nameBox = document.createElement('div');
                    nameBox.className = 'typical-box';

                    const username = document.createElement('h1');
                    username.appendChild(document.createTextNode(data.username));
                    nameBox.appendChild(username);

                    let user = data.username;

                    // if user access his/her own profile -> the button is detail
                    // if access other user profiles -> the button is follow
                    // the button will appear next to the user name
                    if(user !== user_name){


                        let followButton = document.createElement('button');
                        followButton.innerText = "follow";
                        followButton.classList.add("btn");
                        followButton.classList.add("btn-primary");

                        followButton.addEventListener('click', () => {
                       
                            const result = fetch('http://localhost:5000/user/follow?username=' + user, {
                            method: 'PUT',
                            headers:{
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Token ' + token
                                },
                            }).then( (data) => {
                                if(data.status === 403){
                                    alerts('Invalid Auth Token!')
                                }else if(data.status === 400){
                                    alerts('Malformed Request!')
                                }else if(data.status === 404){
                                    alerts('User Not Found!')
                                }else if (data.status === 200) {
                                    alerts(`Follow ${user} successfully!`)
                                    
                                }
                            }).catch( (error) => {
                                console.log('Error: ', error);
                            })
                        })
    
                        username.appendChild(followButton);
                    }else{
                        let detailButton = document.createElement('button');
                        detailButton.innerText = "detail";
                        detailButton.classList.add("btn");
                        detailButton.classList.add("btn-outline-secondary");

                        detailButton.onclick = ( (event) => {
                            event.preventDefault();
                            changePage();
                            editProfile(user);
                        })
                        username.appendChild(detailButton);
                    }
                    
                    const numFollower = document.createElement('div');
                    numFollower.appendChild(document.createTextNode(`Follower: ${data.followed_num}`));
                    
                    nameBox.appendChild(numFollower);
                    main.appendChild(nameBox);

                    const followingBox = document.createElement('div');
                    followingBox.className = 'typical-box';

                    // show a list of people that the user follow
                    const followingLabel = document.createElement('h2');
                    followingLabel.appendChild(document.createTextNode("Following"));
                    followingBox.appendChild(followingLabel);

                    if(data.following.length > 0){
                      
                        const follows = data.following;
                
                        follows.map(follow => {
                            const authorFollow = document.createElement('button');
                
                            const nameFollow = fetch('http://localhost:5000/user?id=' + follow, {
                                method: 'GET',
                                headers:{
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Token ' + token,
                                }, 
                            }).then( (data) => {
                                if(data.status == 400){
                                    alerts("Malformed Request!")
                                }else if (data.status == 403){
                                    alerts("Invalid Auth Token!")
                                }else if (data.status == 404){
                                    alerts("User Not Found!")
                                }else if (data.status == 200){
                                    data.json().then(data => {
                                        authorFollow.innerText = `Followed: ${data.username}`;
                                        authorFollow.onclick = ( (event) => {
                                            event.preventDefault();
                                            changePage();
                                            profileView(data.username);
                                        })
                                    })
                                }
                            }).catch( (error) => {
                                console.log('Error: ', error);
                            })
                
                            followingBox.appendChild(authorFollow);
                        })
                        
                
                        main.appendChild(followingBox);
                    }

                    const infoBox = document.createElement('div');
                    infoBox.className = 'typical-box';

                    const userInfoLabel = document.createElement('h2');
                    userInfoLabel.appendChild(document.createTextNode("User information"));
                    infoBox.appendChild(userInfoLabel);

                    const email = document.createElement('div');
                    email.appendChild(document.createTextNode(`Email: ${data.email}`));
                    infoBox.appendChild(email);

                    const name = document.createElement('div');
                    name.appendChild(document.createTextNode(`Name: ${data.name}`));
                    infoBox.appendChild(name);

                    const numPost = document.createElement('div');
                    numPost.appendChild(document.createTextNode(`Post: ${data.posts.length}`));
                    infoBox.appendChild(numPost);

                    data.posts.map(post => {
                        const userResult = fetch('http://localhost:5000/post?id=' + post, {
                            method: 'GET',
                            headers:{
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token,
                            }, 

                        }).then( (data) => {
                            if(data.status === 403){
                                alert('Invalid Auth Token!')
                            }else if (data.status === 200) {
                                data.json().then(data => {

                                    if(user === user_name){
                                        
                                        const buttonElement = document.createElement('div');
                                        const postContainer = post_box(data);

                                        const delButton = document.createElement('button');
                                        delButton.innerText = "Delete";
                                        delButton.classList.add("btn");
                                        delButton.classList.add("btn-link");
                                        buttonElement.appendChild(delButton);

                                        delButton.onclick =( () => {
                                            const nameAuthor = fetch('http://localhost:5000/post?id=' + data.id, {
                                            method: 'DELETE',
                                            headers:{
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',
                                                'Authorization': 'Token ' + token,
                                            }, 
                                        }).then( (data) => {
                                            if(data.status === 404){
                                                alerts('Post Not Found!')
                                            }else if(data.status === 403){
                                                alerts('Invalid Auth Token!');
                                            }else if(data.status === 400){
                                                alerts('Malformed Request!');
                                            }else if(data.status === 200){
                                                alerts('Delete successfully!');
                                                postContainer.remove();
                                            }

                                        }).catch( (error) => {
                                            console.log('Error: ', error);
                                        })
                                            
                                        })

                                        main.appendChild(postContainer).appendChild(buttonElement);
                                    }else{
                                        main.appendChild(post_box(data));
                                    }
                                
                                })
                                console.log(token);
                            }
                        }).catch( (error) => {
                            console.log('Error: ', error);
                        })
                    })
                    
                    main.appendChild(infoBox);
                })

              
                    
            }
        })
}

// the home button called "profile" on the right top corner 
//  -> user can access his/her own profile
function homeButton(){
    const homeButton = document.createElement('button');
    homeButton.innerText = "Profile";
    homeButton.classList.add("btn");
    homeButton.classList.add("btn-outline-primary");

    homeButton.onclick =( (event) => {
        event.preventDefault();
        changePage();
        profileView('');
        
    })
    nav.appendChild(homeButton);
    
}

// the home button on the right top corner next to home button (profile button)
//  -> user can create new post using this button
function creatPost(){
    let createButton = document.createElement('button');
    createButton.innerText = "Create +";
    createButton.classList.add("btn");
    createButton.classList.add("btn-outline-primary");
    createButton.onclick = ( (event) => {
        event.preventDefault();
        changePage();
        newPost();
    })
    nav.appendChild(createButton);
}

// the "create+" button links to this function
function newPost(){
    const infoBox = document.createElement('form');
    infoBox.className = 'typical-box';

    const createLabel = document.createElement('h2');
    createLabel.appendChild(document.createTextNode("Creating new post"));
    infoBox.appendChild(createLabel);

    let uploadLabel = document.createTextNode('Upload a photo: ');
    infoBox.appendChild(uploadLabel);

    let upload = document.createElement('input');
    upload.setAttribute('type', 'file');
    infoBox.appendChild(upload);

    let descLabel = document.createTextNode('Description: ');
    infoBox.appendChild(descLabel);

    let desc = document.createElement('input');
    desc.setAttribute('type', 'text');
    infoBox.appendChild(desc);

    let createButton = document.createElement('button');
    createButton.innerText = "Submit";
    createButton.classList.add("btn");
    createButton.classList.add("btn-primary");
    infoBox.appendChild(createButton);

    main.appendChild(infoBox);

    infoBox.onsubmit = ( (event) => {
        event.preventDefault();
        
        const fileUpload = infoBox.querySelector('input[type="file"]').files[0];
        if(desc.value === '')   alerts("please write the description!");

        if(fileUpload){
            try{
                fileToDataUrl(fileUpload).then(data => {
                    const createBody = {
                        "description_text": desc.value,
                        "src": data.split(',')[1],
                    };
                    const result = fetch('http://localhost:5000/post', {
                    method: 'POST',
                    headers:{
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token,
                        },
                        body: JSON.stringify(createBody),
                    }).then(data => {
                        if(data.status === 403){
                            alerts('Invalid Auth Token!')
                        }else if(data.status === 400){
                            alerts('Malformed Request / Image could not be processed!')
                        }else if (data.status === 200) {
                            alerts('successfullly uploading new post!')
                        }
                    }) 
                })
            }catch(error){
                console.log('Error: ', error);
            }
        } 
    })  
}

// after clicked the detail button next to the user name
// links to the page that allows user to change their details
// can change password, name, email
function editProfile(user) {
    const editBox = document.createElement('form');
    editBox.className = 'typical-box';

    const createLabel = document.createElement('h2');
    createLabel.appendChild(document.createTextNode(`Updating: ${user_name} details`));
    editBox.appendChild(createLabel);

    let emailLabel = document.createTextNode('New email: ');
    editBox.appendChild(emailLabel);

    let email = document.createElement('input');
    email.setAttribute('type', 'text');
    editBox.appendChild(email);

    let passwordLabel = document.createTextNode('New password: ');
    editBox.appendChild(passwordLabel);

    let password = document.createElement('input');
    password.setAttribute('type', 'text');
    editBox.appendChild(password);

    let nameLabel = document.createTextNode('New name: ');
    editBox.appendChild(nameLabel);

    let name = document.createElement('input');
    name.setAttribute('type', 'text');
    editBox.appendChild(name);

    let createButton = document.createElement('button');
    createButton.innerText = "Submit";
    createButton.classList.add("btn");
    createButton.classList.add("btn-primary");
    editBox.appendChild(createButton);

    editBox.onsubmit= ( (event) => {
        event.preventDefault();
        const editBody = {
            "email": email.value,
            "name": name.value,
            "password": password.value,
        };

        if(password.value === '' || email.value === '' || password === ''){
            alerts('Please fill the form!')
        }else{
            const result = fetch('http://localhost:5000/user?id=' + user, {
            method: 'PUT',
            headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token
                },
                body: JSON.stringify(editBody),
            }).then( (data) => {
                if(data.status === 403){
                    alerts('Invalid Authorization Token!')
                }else if(data.status === 400){
                    alerts('Malformed user object!')
                }else if (data.status === 200) {
                    alerts('Edit the detail successfully!')
                }
            }).catch( (error) => {
                console.log('Error: ', error);
            })
        }
    })

    main.appendChild(editBox);
    
}










