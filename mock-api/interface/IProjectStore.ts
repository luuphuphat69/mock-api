interface ProjectStore {
  projects: IProject[];
  loading: boolean;
  fetchProjects: (userId: string) => Promise<void>;
  addProject: (payload: {}) => Promise<void>;
  updateProject: (id: string, updates: Partial<IProject>) => void;
  deleteProject: (id: string) => Promise<void>;
  clearProjects:() => void;
  patchProject:(id: string, payload:{}) =>Promise<void>
}