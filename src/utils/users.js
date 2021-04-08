const users = [];

// addUser fn.
const addUser = ({ id, username, room }) => {
  // Clean the data.
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // Validate the data.
  if(!username || !room) {
    return {
      error: 'Username and room are required!'
    }
  }
  // Check for existing user.
  const existingUser = users.find(user => {
    return user.room === room && user.username === username
  });

  // Validate username.
  if(existingUser) {
    return {
      error: 'Username is in use!'
    }
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user }

};

// removeUser fn.
const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }

  // Alternative solution.
  // users = users.filter(user => user.id !== id);
};

const getUser = (id) => {
  // Find macthing user, no match returns undefined.
  const matchingUser = users.find(user => user.id === id);
  return matchingUser;
};

const getUsersInRoom = (roomName) => {
  let usersInRoom = [];
  // Return an array with all users in current room.
  usersInRoom = users.filter(user => user.room === roomName.trim().toLowerCase());

  return usersInRoom;
};

addUser({
  id: 22,
  username: 'Andrew',
  room: 'South Philly'
});

addUser({
  id: 42,
  username: 'Mike',
  room: 'South Philly'
});

addUser({
  id: 32,
  username: 'Andrew',
  room: 'Center City'
});

console.log(users);


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

/*** TEST FUNCTIONS ***/

  // const usersInRoom = getUsersInRoom('south philly');
  // console.log('IN ROOM: ', usersInRoom);
  
  // const matcedhUser = getUser(42);
  
  // console.log('MATCH: ', matchedUser);
  
  // const res = addUser({
  //   id: 33,
  //   username: 'Andrew',
  //   room: 'South philly'
  // });
  
  // const removedUser = removeUser(22);
  
  // console.log(removedUser)
  // console.log(users)
  
  // console.log(res);