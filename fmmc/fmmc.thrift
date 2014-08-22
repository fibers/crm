namespace cpp fmmc
namespace d fmmc
namespace java fmmc
namespace php fmmc
namespace perl fmmc

enum SellSide {
  TARGET_IS_BUYER = 1,
  TARGET_IS_SELLER = 0
}

struct Party {
    1: i32 id,
    2: string nick,
    3: string head,
}

struct Item {
    1: i32 id,
    2: string image,
    3: string title,
}

struct QuestionDto {
    1: Item item,
    2: Party buyer,
    3: Party seller,
    4: bool isReply,
    5: string content,
    6: i32 entryId,
}

struct OfferDto {
     1: Item item,
     2: Party buyer,
     3: Party seller,
     4: double price,
     5: string comment,
     6: SellSide sellSide,
     7: i32 threadId,
     8: i32 entryId,
}

struct ChatDto {
     1: Item item,
     2: Party buyer,
     3: Party seller,
     4: string content,
     5: i32 threadId,
     6: byte sellSide,
     7: i32 entryId,
}

struct FeedbackDto {
     1: Item item,
     2: Party buyer,
     3: Party seller,
     4: byte rateNum,
     5: string comment,
     6: SellSide sellSide,
     7: i32 threadId,
     8: i32 entryId,
}

struct MessageDto {
     1: i32 receiverId,
     2: string template,
     3: optional string content,
     4: optional map<string, string> placeholders,
}

exception FmmcApiError {
  1: i32 errorCode,
  2: string errorMsg,
}

service FmmcApi {
    void sendQuestion(1: QuestionDto questionDto) throws (1:FmmcApiError error),
    void sendOffer(1: OfferDto offerDto) throws (1:FmmcApiError error),
    void sendChat(1: ChatDto chatDto) throws (1:FmmcApiError error),
    void sendFeedback(1: FeedbackDto feedbackDto) throws (1:FmmcApiError error),
    void sendMessage(1: MessageDto messageDto) throws (1:FmmcApiError error)
}