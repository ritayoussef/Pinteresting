# Web Programming - Proposal

Naomie Edward, Rita Youssef, Eric Stoian

Introducing "Pinteresting" - a plaform where one can post pictures and connect with the community of their choice.

- Find people with similat interest
- Share you ideas with the world
- Find your aesthetic by viewing what others are posting

Our platform offers a simple way of sharing your ideas and interacting with people. We aim to create communities more easily by uniting people with the same hobbies.

## Core Functionality

- **Picture Posting**: Users can post pictures as well as add a caption.
- **Commenting**: Users can comment on posts.
- **Tags/Filtering**: Tags can be added to posts allowing users to filter posts by tags.
- **Light/Dark mode**: Users can change the theme of the website to have a different appearance using a toggle button.
- **Save**: Users are able to save posts and view them in a seperate window.

## Features

- Like a post.
- Save a post.
- Most liked/Most active users
- Comment on a post.
- filtering posts.
- Add tags to a post.
- Have a pinned post.

## Requirements

### Posts Stories

- As a user, I want to be able to post a picture so that I can share what's on my mind.
- As a user I want to be able to add tags to my post so that I can reach specific communities.
- As a user, I want to be able to save a post so that I can view it later.
- As a user, I want to be able to edit a post I created so that I can change the caption.
- As a user, I want to be able to add a caption to my post to describe my picture.
- As a user, I want to be able to delete my post in case I don't want it anymore.

### Comment Stories
- As a user, I want to be able to edit a comment in case I change my mind.
- As a user, I want to be able to delete a comment in case I don't want it there anymore.
- As a user I want to be able to make a comment on a post so that I can share my opinion.
- As a user, I want to be able to see comments by other users.

### User Account Stories

- As a user, I want to be able to change my profile picture in case I change my mind.
- As a user I want to be able to edit my biography.
- As a user, I want to be able to unsave a post from my favourites, so that I can only have the ones I like.

## Entity Relationships
![Alt text](<ERD_Diagram.png>)

## API Routes

### Post Management

| Request| Action | Response | Description |
| :------|--------| :------: | ------------:|
| POST/posts | PostController::createPost | 201 /posts/:id | Create a new post and redirect to the post's view |
| GET/posts/:id | PostController::getPost | 200 PostDetailView | Retrieve details of a specific post |
| PUT/posts/:id | PostController::updatePost | 200 PostDetailView | Update an existing post's information |
| PUT/posts/:id | PostController::updatePost | 403 /posts/:id | Forbidden if trying to edit a post the user did not create
| DELETE/posts/:id | PostController::deletePost | 403 /posts | Delete a post |
| POST/posts/:id/likes | PostController::likePost | 201 /posts/:id/likes | Like a post
| POST/posts/tag/:tagName | PostController::getTagged | 201 /posts/tagName | Tag a post
| POST/posts/:id/favourites | PostController::favouritePost | 201 /posts/:id/favourites | Add a post to favourites

### Comments Management

| Request| Action | Response | Description |
| :------------|--------| :------: | ------------:|
| POST/posts/:postId/comment | PostController::createComment | 201 /posts/:id/comment | Create a new comment and redirect to the post's view|
| GET/posts/:postId/comment/:commentId | PostController::getComment | 200 CommentView | Retrieve details of a specific comment |
| PUT/posts/:postId/comment/:commentId | PostController::updateComment | 201  EditCommentView | Update an existing comment|
| PUT/posts/:postId/comment/:commentId | PostController::updateComment | 403 /posts/:postId/comment/:commentId | Forbidden if trying to edit a comment the user did not create
| DELETE/posts/:postId/comment/:commentId | PostController::deleteComment | 204 403 /posts/:postId/comment/:commentId | Forbidden if trying to delete a comment that the user did not create and Delete a comment |

### User Account

| Request| Action | Response | Description |
| :------|--------| :------: | ------------:|
| PUT/user/:userId | PostController::updateUser| 201 EditUserView| Update a user account |
| GET/user/:userId | PostController::getUser | 200 UserDetailView | Retrieve details of a specific user|
| DELETE/user/:userId | PostController::deleteUser | 204 /user/:userId | Delete a user account |
| PUT/user/:userId | PostController::updatePost | 403/user/:userId |Forbidden if trying to edit another user account
POST/login|	AuthController::login|	200 LoginSuccessView, 401 LoginFailedView	|Log in a user
POST/logout	| AuthController::logout|	200 LogoutSuccessView	|Log out a user
POST/register|	AuthController::register|	201 RegisterSuccessView, 400 RegisterFailedView	|Register a new user
| GET/user/:id/likes | PostController::getLikePost | 201 /posts/:id/likes | get how many likes the user has done
| GET/user/:id/tag/:tagName| PostController::getTaggedPost | 201 /posts/:id/tagged | how many tags the user has
| GET/user/:id/favourites | PostController::getLikePost | 201 /posts/:id/likes | how many favourites that user has

## Wireframes

![Alt text](<HomePage.png>)

This is the first page that users will see, They will have the option to see a few posts but won't be able to use the filter, only view them as is. They will have the option to login if they have an account or register if they don't.

![Alt text](<Register.png>)

Here users will have the option to make an account by entering their email and wanted password.

![Alt text](<Login.png>)

Here users will be able to login if they already have an account.

![Alt text](<LoggedInPage.png>)

Logged in users are able to see posts and filter them by tag as well as save and like them. They can also click on the post to see more information and comments.

![Alt text](<ViewPost.png>)

Here users will be able to see more information about a post like the author and comments made.

![Alt text](<Account.png>)

On the user account we can see a user's pinned post as well as all of the other posts they made. They can see their favourite posts, comments they made. If the account belongs to the logged in user they'll have the 'delete account' button as well as 'edit account' button.

![Alt text](<PostEdit.png>)
![Alt text](<EditComment.png>)

Users will have the option to post comments on a post. If a logged in user clicks on their own comment they can edit it.