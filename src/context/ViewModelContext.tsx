import React, { createContext, useContext, ReactNode } from 'react';
import { UserViewModel } from '../viewmodel/userViewModel';
import { HorarioViewModel } from '../viewmodel/horarioViewModel';
import { MateriasViewModel } from '../viewmodel/materiasViewModel';
import { ClasesViewModel } from '../viewmodel/clasesViewModel';
import { ActividadesViewModel } from '../viewmodel/actividadesViewModel';

interface ViewModelContextType {
  userViewModel: UserViewModel;
  horarioViewModel: HorarioViewModel;
  materiasViewModel: MateriasViewModel;
  clasesViewModel: ClasesViewModel;
  actividadesViewModel: ActividadesViewModel;
}

const ViewModelContext = createContext<ViewModelContextType | undefined>(undefined);

interface ViewModelProviderProps {
  children: ReactNode;
}

export const ViewModelProvider: React.FC<ViewModelProviderProps> = ({ children }) => {
  // Inicializar ViewModels como singletons/instancias únicas usando useMemo
  const userViewModel = React.useMemo(() => new UserViewModel(), []);
  const horarioViewModel = React.useMemo(() => new HorarioViewModel(), []);
  const materiasViewModel = React.useMemo(() => new MateriasViewModel(), []);
  const clasesViewModel = React.useMemo(() => new ClasesViewModel(), []);
  const actividadesViewModel = React.useMemo(() => new ActividadesViewModel(), []);

  const value: ViewModelContextType = React.useMemo(
    () => ({
      userViewModel,
      horarioViewModel,
      materiasViewModel,
      clasesViewModel,
      actividadesViewModel,
    }),
    [userViewModel, horarioViewModel, materiasViewModel, clasesViewModel, actividadesViewModel]
  );

  return (
    <ViewModelContext.Provider value={value}>
      {children}
    </ViewModelContext.Provider>
  );
};

export const useViewModelContext = (): ViewModelContextType => {
  const context = useContext(ViewModelContext);
  if (!context) {
    throw new Error('useViewModelContext must be used within a ViewModelProvider');
  }
  return context;
};
