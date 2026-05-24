const notifyCodes = {
  '100': {
    template: '{user} was added to project {project}',
    type: 'minor',
  },
  '101': {
    template: '{user} was removed from project {project}',
    type: 'minor',
  },
  '102': {
    template: '{user} has left project {project}',
    type: 'minor',
  },
  '104': {
    template: '{user} is waiting to join project {project}',
    type: 'urgent',
  },

  '200': {
    template: 'Project {project} information was updated',
    type: 'medium',
  },
  '201': {
    template: 'API key for project {project} was renewed',
    type: 'urgent',
  },
  '202': {
    template: 'Access key for project {project} was renewed',
    type: 'urgent',
  },
  '203': {
    template: 'Project {project} has reached the resource limitation',
    type: 'minor',
  },

  '300': {
    template: 'Resource {resource} was created in project {project}',
    type: 'minor',
  },
  '301': {
    template: 'Resource {resource} was removed from project {project}',
    type: 'urgent',
  },
  '302': {
    template: 'Resource {resource} was updated in project {project}',
    type: 'medium',
  },
  '303': {
    template: 'Resource {resource} has reached the dataset limitation',
    type: 'minor',
  },
};

module.exports = notifyCodes;