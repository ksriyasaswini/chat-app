const users = []

// AddUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // Clear the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required!!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser) {
        return {
            error:'Username already taken!!'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return{ user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const existingUser = users.find((user)=>{
        return user.id === id
    })
    if(!existingUser) {
        return {
            error:'User Not found'
        }
    }
    return existingUser
}

const getUsersInRoom = (room) => {
    const existingUser = users.filter((user)=>{
        return user.room === room
    })
    if(!existingUser) {
        return {
            error:'User Not found'
        }
    }
    return existingUser
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}