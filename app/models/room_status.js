const mongoose = require('mongoose');
const Helper = require('../common/Helper');
const roomStatusSchema = require('../schemas/room_status');
const model = mongoose.model('room_status', roomStatusSchema);

const commonModel = require('./common_model');

const fake = [
    {
        gas: 0,
        flame: 0,
        data: new Date().toISOString(),
    },
    {
        gas: 1,
        flame: 0,
        data: new Date().toISOString(),
    },

]

const roomStatusModel = {
    ...commonModel,
    fakeData: fake,
    model: model,

    getLastItemsByRoomId: function (id, qty) {
        return this.model.find({ room: id }).limit(qty).sort({ _id: -1 });
    },

    getLastItemsAfterTimeByRoomId: function (id, time) {
        console.log('id', id)
        console.log('time', time)
        return this.model.find(
            {
                room: id,
                $or: [
                    {
                        gas: 0,
                    },
                    {
                        flame: 0,
                    },
                ],
                date: {
                    $gte: time,
                }
            }
        ).sort({ _id: -1 });
    },


    listItemAfterDateByRoomId: function (roomId, startDate) {
        return this.model.find({
            room: `${Helper.toObjectId(roomId)}`,
            date: {
                $gt: startDate.toISOString()
            }
        })
    },

    listWarningAfterDateByRoomId: function (roomId, startDate) {
        return this.model.find({
            room: `${Helper.toObjectId(roomId)}`,
            date: {
                $gt: startDate.toISOString()
            },
            $or: [
                {
                    gas: 0,
                },
                {
                    flame: 0,
                },
            ]

        })
    },

    getWarning: function (type) {
        const flameWarning = {
            "flame": 0,
            "gas": 1,
            "room": Helper.toObjectId('6162ef282821861b2881a580'),
        };

        const gasWarning = {
            "flame": 1,
            "gas": 0,
            "room": Helper.toObjectId('6162ef282821861b2881a580'),
        };

        const allWarning = {
            "flame": 0,
            "gas": 0,
            "room": Helper.toObjectId('6162ef282821861b2881a580'),
        };
        switch (type) {
            case 'all':
                return allWarning;
            case 'flame':
                return flameWarning;
            case 'gas':
                return gasWarning;
        }
    },

    genWarnings: function (start, duration, type) {
        let d = start;
        const warnings = [...Array(duration)].map(_ => {
            const warning = this.getWarning(type);
            d.setMinutes(d.getMinutes() + 1);
            warning.date = d.toISOString();
            return warning;
        })
        return warnings;
    },

    // insert
    insertFakeDocs: async function () {
        try {
            const gasWarnings1 = this.genWarnings(new Date(2021, 10, 6, 9, 15), 30, 'gas');
            const flameWarnings1 = this.genWarnings(new Date(2021, 10, 6, 9, 40), 530, 'flame');

            const gasWarnings2 = this.genWarnings(new Date(2021, 10, 15, 3, 50), 20, 'gas');
            const flameWarnings2 = this.genWarnings(new Date(2021, 10, 15, 4, 9), 300, 'flame');

            const gasWarnings3 = this.genWarnings(new Date(2021, 10, 21, 22), 130, 'gas');
            const flameWarnings3 = this.genWarnings(new Date(2021, 10, 22, 0, 10), 240, 'flame');

            const bothWarnings = this.genWarnings(new Date(2021, 10, 23, 2), 100, 'all');
            const data = gasWarnings1.concat(flameWarnings1, gasWarnings2, flameWarnings2, gasWarnings3, flameWarnings3, bothWarnings);
            await this.model.deleteMany({});
            const result = await this.model.insertMany(data);
            return result;
        } catch (e) {
        }
    },
}

module.exports = roomStatusModel;