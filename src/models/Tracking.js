import React, { useEffect } from "react";
import { DatabaseConnection } from "../database/database-connection";
import DeviceInfo from 'react-native-device-info';
import { useAuth } from "../services/AuthService";

const db = DatabaseConnection.getConnection();

const TrackingModel = () => {

    const uniqueId = DeviceInfo.getUniqueId();
    const { user } = useAuth();

    const model = {
        deviceId: null,
        startDate: null,
        endDate: null,
        initialCoordinate: null,
        finalCoordinate: null,
        status: null,
        tracking: [],
        trackingInfo: [],
        finished: false, //TODO selected by user,
        postErrors: null
    };

    const modelKeys = {
        deviceId: "ID do dispositivo",
        startDate: "Data início",
        endDate: "Data término",
        initialCoordinate: "Coordenada inicial",
        finalCoordinate: "Coordenada final",
        status: "Situação",
        tracking: "Trajeto",
        trackingInfo: "Informações do trajeto",
        finished: "Finalizado?"
    };

    useEffect(() => {
        init();
    })

    const ExecuteQuery = (sql, params = []) => new Promise((resolve, reject) => {
        db.transaction((trans) => {
          trans.executeSql(sql, params, (trans, results) => {
            resolve(results);
          },
            (error) => {
              reject(error);
            });
        });
    });

    const list = async () => {
        let query = await ExecuteQuery(
                `SELECT 
                    * 
                FROM 
                    tracking 
                WHERE 
                    apiid IS NULL 
                    AND removedat IS NULL 
                ORDER BY id DESC`
            );
        let rows = query.rows;
        let list = [];

        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            let data = JSON.parse(item.data);
            data['id'] = item.id;
            data['postErrors'] =  item.posterrors ? JSON.parse(item.posterrors) : null;
            list.push(data);
        }

        return list;
    }

    const listPostData = async () => {
        let query = await ExecuteQuery(
                `SELECT 
                    * 
                FROM 
                    tracking 
                WHERE 
                    apiid IS NULL 
                    AND removedat IS NULL 
                ORDER BY id DESC`
            );
        let rows = query.rows;
        let list = [];

        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            let data = JSON.parse(item.data);

            if (data.status === 'finished') {
                list.push(data);
            }
        }

        return list;
    }

    const find = async (id) => {

        let query = await ExecuteQuery(
            `SELECT 
                * 
            FROM 
                tracking 
            WHERE 
                apiid IS NULL 
                AND removedat IS NULL 
                AND id = ?`, [id]);
        let rows = query.rows;
        let model = null;

        if (rows.length > 0) {
            let item = rows.item(0);
            model = JSON.parse(item.data);
            model['id'] = item.id;
            model['postErrors'] =  item.posterrors ? JSON.parse(item.posterrors) : null;
        }
        
        return model;

    }

    const save = async (model) => {
        let data = { ...checkModel(model) };
        let id = data.id;
        let deviceUniqueId = data.deviceId;
        delete data.id;
        let json = JSON.stringify(data); 
        let params = [json];
        let sql = '';

        if (id > 0) {
            sql = 'UPDATE tracking SET data = ? WHERE id = ?';
            params.push(id)
        } else {
            sql = 'INSERT INTO tracking (data, deviceuniqueid, createdat, createdby) VALUES (?, ?, ?, ?)';
            
            params.push(deviceUniqueId);
            params.push(new Date().getTime());
            params.push(user.id);
        }

        let query = await ExecuteQuery(sql, params);
        let result = query.rowsAffected > 0;
        return result;        
    }

    const logicalRemove = async (id) => {
        let sql = 'UPDATE tracking SET removedat = ?, removedby = ? WHERE id = ?';
        let query = await ExecuteQuery(sql, [new Date().getTime(), user.id, id]);
        return query.rowsAffected > 0; 
    }

    const remove = async (id) => {
        let query = await ExecuteQuery('DELETE FROM tracking WHERE id = ?', [id]);
        return query.rowsAffected > 0;        
    }

    const removeAll = async (id) => {
        let query = await ExecuteQuery('DELETE FROM tracking');
        return query.rowsAffected > 0;        
    }

    const updatePostDataSuccess = async (list) => {
        let count = 0;

        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let sql = 'UPDATE tracking SET apiid = ? WHERE deviceuniqueid = ?';
            let query = await ExecuteQuery(sql, [item.id, item.deviceId]);   
            count += query.rowsAffected;
        }
        
        return count == list.length;
    }

    const updatePostDataErrors = async (list) => {
        let count = 0;

        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let sql = 'UPDATE tracking SET posterrors = ? WHERE deviceuniqueid = ?';
            let errors = JSON.stringify(item.errors);
            let query = await ExecuteQuery(sql, [errors, item.data.deviceId]);   
            count += query.rowsAffected;
        }

        return count == list.length;
    }

    const checkModel = (model) => {
        if (model.startDate === null) {
            let location = model.tracking.reduce(function (prev, curr) {
                return prev.timestamp < curr.timestamp ? prev : curr;
            });

            let d = new Date().getTime();
            model.deviceId = uniqueId + '_' + d;
            model.startDate = location.timestamp;
            model.initialCoordinate = { latitude: location.latitude, longitude: location.longitude };                   
        }

        if (model.status === 'finished' && model.endDate === null) {
            let location = model.tracking.reduce(function (prev, curr) {
                return prev.timestamp > curr.timestamp ? prev : curr;
            });

            model.endDate = location.timestamp;
            model.finalCoordinate = { latitude: location.latitude, longitude: location.longitude };
        }

        return model;
    }

    const init = () => {
        
        db.transaction(function (txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='tracking'",
                [],
                function (tx, res) {
                    
                    if (res.rows.length == 0) {
                        //txn.executeSql('DROP TABLE IF EXISTS tracking', []);
                        txn.executeSql(
                            `CREATE TABLE IF NOT EXISTS tracking
                                (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                    apiid INTEGER, 
                                    deviceuniqueid TEXT,
                                    data TEXT,
                                    createdat INTEGER,
                                    createdby INTEGER,
                                    removedat INTEGER,
                                    removedby INTEGER,
                                    posterrors TEXT
                                )`,
                            []
                        );
                    }
                }
            );
        });

    }

    return {
        model,
        modelKeys,
        find,
        list,
        save,
        logicalRemove,
        remove,
        removeAll,
        listPostData,
        updatePostDataSuccess,
        updatePostDataErrors
    }
}

export default TrackingModel;