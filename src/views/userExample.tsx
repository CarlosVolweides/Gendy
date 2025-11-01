import { observer } from 'mobx-react-lite';
import { UserViewModel } from '../viewmodel/userViewModel';
import { useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';

const vm = new UserViewModel();

export const UserExample = observer(() => {
  useEffect(() => {
    vm.loadUser();
  }, []);

  if (vm.loading) return <Text>Cargando...</Text>;

  if (!vm.hasUser) {
    // pantalla para crear usuario
    return (
      <View>
        <Text>Ingrese su nombre</Text>
        <TextInput onChangeText={(text) => vm.userName = text} />
        <Button title="Crear usuario" onPress={() => vm.createUser(vm.userName as string)} />
      </View>
    );
  }
  if (vm.isUpdating) {
    return (
      <View>
        <Text>Escribe el nuevo nombre:</Text>
        <TextInput onChangeText={(text) => vm.userName = text} />
        <Button title="Actualizar usuario" onPress={() => vm.updateUserName(vm.userName as string)} />
      </View>
    );
  }

  // pantalla de bienvenida
  return (
    <View>
      <Text>Bienvenido, {vm.userName}</Text>
      <Button title="Actualizar nombre" onPress={() => vm.setUpdating(true)} />
      <Button title="Borrar usuario" onPress={() => vm.deleteUser()} />
    </View>
  );
});
