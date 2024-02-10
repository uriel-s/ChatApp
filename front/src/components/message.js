// Message.js
import React from 'react';

const Message = ({ senderName, name, text, isViewed }) => {
  return (
    <div className="message">
      <p className="message-username">
        {senderName}: {text}
        {senderName === name && (
          <img
            src={isViewed ? '/icons8-circled-blue.png' : '/icons8-circled-grey.png'}
            style={{ width: '15px', height: '15px' }}
          />
        )}
      </p>
    </div>
  );
};

export default Message;