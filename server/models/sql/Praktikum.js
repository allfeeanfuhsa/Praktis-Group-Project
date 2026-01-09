// server/models/sql/Praktikum.js
module.exports = (sequelize, DataTypes) => {
  const Praktikum = sequelize.define('Praktikum', {
    id_praktikum: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    mata_kuliah: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tahun_pelajaran: {
      type: DataTypes.STRING(9),
      allowNull: false
    },
    jadwal: { type: DataTypes.STRING(50) },
    ruangan: { type: DataTypes.STRING(50) },
    sks: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    semester: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'praktikum',
    timestamps: false
  });
  return Praktikum;
};