/* global $, JitsiMeetJS */
// ルーム名
const roomName = 'test_room';

let room = null; // ルームを格納する変数
let localTracks = null; // ユーザーの音声トラック
const remoteTracks = {}; // ルーム参加者の音声トラック

// Jitsi SDK側での出力するログレベルの設定
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

// JitsiMeetJSの初期化
const initOptions = {
    disableAudioLevels:  true,
};
JitsiMeetJS.init(initOptions);

// コネクションの作成
const jitsiConfig = {
    hosts: {
        domain: 'meet.jitsi',
        muc: 'muc.meet.jitsi',
    },
    focusUserJid: 'focus@auth.meet.jitsi',
    serviceUrl: 'https://webrtc-dev01.visualive.tokyo:8443/http-bind',
    websocket: 'wss://webrtc-dev01.visualive.tokyo:8443/xmpp-websocket',
    disableNS: true,
}
const connection = new JitsiMeetJS.JitsiConnection(null, null, jitsiConfig);

// 接続が成功した場合のイベント
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => {
    console.log('connection success!');
    room = connection.initJitsiConference(roomName, {});

    // ルームに他の参加者のトラックが追加された時のイベント
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
        if (track.isLocal() || track.getType() !== 'audio') {
            return;
        }

        // 参加者のID取得
        const participant = track.getParticipantId();
        console.log('track of participant: ' + participant + ' is added to this room');

        if (!remoteTracks[participant]) {
            remoteTracks[participant] = [];
        }

        // 参加者を追加
        const idx = remoteTracks[participant].push(track);
        const id = participant + track.getType() + idx;
        // audioタグの追加機能は有効のまま非表示にする display:noneの場合、機能も無効になる可能性があるので使っていない
        $('#participant-audio-streams').append(
            `<audio autoplay='1' style="position: absolute; left: -9999px; visibility: hidden;" class='${participant}' id='${id}' controls/>`);
        track.attach($(`#${id}`)[0]);
    });

    // ルームに参加した際のイベント
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED,() => {
        console.log('conference joined!');
        // 自分の音声トラックをルームに追加
        for (let i = 0; i < localTracks.length; i++) {
            room.addTrack(localTracks[i]);
        }
    });

    // ルームから他の参加者が退出した際のイベント
    room.on(JitsiMeetJS.events.conference.USER_LEFT, (id) => {
        if (!remoteTracks[id]) {
            return;
        }

        console.log('participant: ' + id + ' left');
        delete remoteTracks[id];
        $('.' + id).remove();
    });

    // ルームに参加
    room.join();
});

// 接続が失敗した場合のイベント
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, () => {
    console.log('connection failed');
});


// ユーザーの音声トラックを作成
JitsiMeetJS.createLocalTracks({ devices: [ 'audio'] })
    // 音声トラック作成後の処理
    .then((tracks) => {
        localTracks = tracks;

        // 音声トラック作成後にJitsiに接続
        connection.connect();
    })
    .catch(error => {
        throw error;
    });

// 音声出力切り替え
function changeAudioOutput(selected) {
    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
}

// ミュートの切り替え ミュートボタンで使用
let isMuted = false; // ミュート状態
function changeMuteStatus() {
    /*
    for (let i = 0; i < localTracks.length; i++) {
        if (localTracks[i].getType() === 'audio') {
            if (!isMuted) {
                localTracks[i].mute();
            } else {
                localTracks[i].unmute();
            }
        }
    }
    isMuted = !isMuted;
    $('#mute-btn').text(isMuted ? 'ON' : 'OFF');
    */
    setMute( !isMuted );
}

function setMute(isMute)
{
    if (!localTracks) return;
    for (let i = 0; i < localTracks.length; i++) {
        if (localTracks[i].getType() === 'audio') {
            if (isMute) {
                localTracks[i].mute();
            } else {
                localTracks[i].unmute();
            }
        }
    }
    isMuted = isMute;
    $('#mute-btn').text(isMuted ? 'ON' : 'OFF');
}


// ページが閉じられた際の処理
function unload() {
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].dispose();
    }
    room.leave();
    connection.disconnect();
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);

// 音声出力切り替えセレクターの作成
if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
    JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
        const audioOutputDevices
            = devices.filter(d => d.kind === 'audiooutput');

        $('#audioOutputSelect').html(
            audioOutputDevices
                .map(
                    d =>
                        `<option value="${d.deviceId}">${d.label}</option>`)
                .join('\n'));

        $('#audioOutputSelectWrapper').show();
    });
}
