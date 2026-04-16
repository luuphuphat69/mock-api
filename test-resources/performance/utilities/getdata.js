const user = JSON.parse(open('../data/user.json'));
const project = JSON.parse(open('../data/project.json'));

const getData = {
    userData(key) {
        return key ? user[key] : user;
    },

    projectData(key) {
        return key ? project[key] : project;
    },
};

export default getData;
