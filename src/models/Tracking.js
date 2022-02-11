import React, { useEffect } from "react";
import { DatabaseConnection } from "../database/database-connection";

const db = DatabaseConnection.getConnection();

const TrackingModel = () => {

    const model = {
        id: null,
        startDate: null,
        endDate: null,
        startPoint: null,
        endPoint: null,
        status: null,
        tracking: [],
        trackingInfo: [],
        createdAt: null,
        createdBy: null,
        removedAt: null,
        removedBy: null
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
        let query = await ExecuteQuery('SELECT * FROM tracking ORDER BY id DESC');
        let rows = query.rows;
        let list = [];

        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            let data = JSON.parse(item.data);
            data['id'] = item.id;
            list.push(data);
        }

        return list;
    }

    const find = async (id) => {

        let query = await ExecuteQuery('SELECT * FROM tracking WHERE id = ?', [id]);
        let rows = query.rows;
        let model = null;

        if (rows.length > 0) {
            let item = rows.item(0);
            model = JSON.parse(item.data);
            model['id'] = item.id;
        }
        
        return model;

    }

    const save = async (model) => {
        let data = { ...checkModel(model) };
        let id = data.id;
        delete data.id;
        let sql = 'INSERT INTO tracking (data) VALUES (?)';
        let json = JSON.stringify(data);
        let params = [json];

        if (id !== null) {
            sql = 'UPDATE tracking SET data = ? WHERE id = ?';
            params.push(id)
        }

        let query = await ExecuteQuery(sql, params);
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

    const checkModel = (model) => {
        if (model.startDate === null) {
            let location = model.tracking.reduce(function (prev, curr) {
                return prev.timestamp < curr.timestamp ? prev : curr;
            });

            model.startDate = location.timestamp;
            model.startPoint = { latitude: location.latitude, longitude: location.longitude };
            model.createdAt = new Date().getTime();
            model.createdBy = 1; //TODO create logic to get current user in app            
        }

        if (model.status === 'finished' && model.endDate === null) {
            let location = model.tracking.reduce(function (prev, curr) {
                return prev.timestamp > curr.timestamp ? prev : curr;
            });

            model.endDate = location.timestamp;
            model.endPoint = { latitude: location.latitude, longitude: location.longitude };
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
                        console.log("Tracking table created");

                        txn.executeSql('DROP TABLE IF EXISTS tracking', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS tracking(id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)',
                            []
                        );
                    } else {
                        console.log("Tracking table exist");
                    }

                }
            );
        });

    }

    return {
        model,
        find,
        list,
        save,
        remove,
        removeAll
    }
}

export default TrackingModel;