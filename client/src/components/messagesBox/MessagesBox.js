import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import useHttp from '../../hooks/useHttp';
import MessagesBody from '../messagesBody/MessagesBody';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Editor, EditorState, ContentState, convertToRaw } from 'draft-js';
import { compositeDecorator } from '../../helpers/decorators';
import { ReactComponent as InfoIcon } from '../../assets/icons/info.svg';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as GifIcon } from '../../assets/icons/gif.svg';
import { ReactComponent as SmileIcon } from '../../assets/icons/smile.svg';
import { ReactComponent as PlaneIcon } from '../../assets/icons/plane.svg';
import './messagesBox.scss';

const MessagesBox = () => {
    const [messages, setMessages] = useState([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty(compositeDecorator));
    const [disabled, setDisabled] = useState(true);
    const [offsetHeight, setOffsetHeight] = useState();
    const [socket, setSocket] = useState({});
    const { request } = useHttp();
    const footerRef = useRef(null);
    const messagesRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        setSocket(io(process.env.REACT_APP_DOMAIN));
    }, [setSocket]);

    useEffect(() => {
        if (Object.keys(socket).length !== 0) {
            socket.on('thread message', (data) => {
                setMessages((prev) => [...prev, data]);
            });
        }
    }, [socket]);

    const params = useParams();
    const observer = useRef(
        new ResizeObserver((entries) => {
            const { offsetHeight } = entries[0].target;
            setOffsetHeight(offsetHeight);
        }),
    );

    const getMessages = useCallback(
        async (id) => {
            try {
                socket.emit('thread opened', { id });
                const response = await request(`/api/direct/messages?threadId=${id}`, 'GET');
                if (response && response.status === 200 && response.status !== 500) {
                    setMessages(response.messages);
                }
            } catch (e) {}
        },
        [request, socket],
    );

    const sendMessage = useCallback(async () => {
        try {
            const message_text = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
            setEditorState((prevState) => EditorState.push(prevState, ContentState.createFromText('')));
            await request('/api/direct/message/new', 'POST', {
                threadId: params.threadId,
                message_text,
            });
            editorRef.current.focus();
        } catch (e) {}
    }, [request, editorState, params.threadId, socket, EditorState, ContentState]);

    useEffect(() => {
        if (footerRef.current) observer.current.observe(footerRef.current);
        return () => {
            observer.current.unobserve(footerRef.current);
        };
    }, [footerRef, observer]);

    useEffect(() => {
        messagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [offsetHeight, messages]);

    useEffect(() => {
        let isSubscribed = true;
        if (isSubscribed) getMessages(params.threadId);
    }, [getMessages, params.threadId]);

    return (
        <div className="messageBox" style={{ paddingBottom: `${offsetHeight}px` }}>
            <div className="messageBox__header">
                <div className="messageBox__header--left">
                    <h2 className="messageBox__header-name">Gary Simon</h2>
                    <span className="messageBox__header-handle">@designcoursecom</span>
                </div>
                <div className="messageBox__header-icon" tabIndex="0">
                    <div className="messageBox__header-icon-inner" tabIndex="-1">
                        <InfoIcon />
                    </div>
                </div>
            </div>
            <MessagesBody messages={messages} ref={messagesRef} />
            <div className="messageBox__footer" ref={footerRef}>
                <div className="messageBox__footer-icon" tabIndex="0">
                    <div className="messageBox__footer-icon-inner" tabIndex="-1">
                        <ImageIcon />
                    </div>
                </div>
                <div className="messageBox__footer-icon" tabIndex="0">
                    <div className="messageBox__footer-icon-inner" tabIndex="-1">
                        <GifIcon />
                    </div>
                </div>
                <div className="messageBox__footer-input-group">
                    <div className="messageBox__footer-input">
                        <Editor
                            ref={editorRef}
                            editorState={editorState}
                            onChange={(editorState) => {
                                const textLength = editorState.getCurrentContent().getPlainText().length;
                                setDisabled(textLength < 1 ? true : false);
                                setEditorState(editorState);
                            }}
                            placeholder="Start a new message"
                        />
                    </div>
                    <div className="messageBox__footer-icon messageBox__footer-input-icon" tabIndex="0">
                        <div
                            className="messageBox__footer-input-icon-inner messageBox__footer-icon-inner"
                            tabIndex="-1"
                        >
                            <SmileIcon />
                        </div>
                    </div>
                </div>
                <div
                    onClick={sendMessage}
                    className={`messageBox__footer-icon ${disabled && 'messageBox__footer-icon--disabled'}`}
                    tabIndex="0"
                >
                    <div className="messageBox__footer-icon-inner" tabIndex="-1">
                        <PlaneIcon />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesBox;
