interface IProjectStore {
  projects: IProject[];
  loading: boolean;
  fetchProjects: (userId: string) => Promise<void>;
  addProject: (payload: {}) => Promise<void>;
  updateProject: (id: string, updates: Partial<IProject>) => void;
  deleteProject: (userid:string, id: string) => Promise<void>;
  clearProjects:() => void;
  patchProject:(userid:string, id: string, payload:{}) =>Promise<void>
}