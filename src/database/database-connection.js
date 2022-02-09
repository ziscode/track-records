

import SQLite from 'react-native-sqlite-storage';

// Conexão com o Banco de Dados do Sqlite 
export const DatabaseConnection = {
  getConnection: () => SQLite.openDatabase(
    {
      name:'app-database',
      location: 'default'
    },
    () => {},
    error => { console.log(error) }
  ),
};