from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class PromptTemplate:
    @staticmethod
    def contextual_question_prompt():
        return ChatPromptTemplate.from_messages([
            (
                "system",
                """
                Given a chat history and the latest user question,
                rewrite the question so it can be understood
                without the chat history.

                Do NOT answer the question.
                """
            ),

            MessagesPlaceholder(
                variable_name="chat_history"
            ),

            (
                "human",
                "{input}"
            )
        ])
       
    @staticmethod
    def qa_prompt():
        return ChatPromptTemplate.from_messages([
            (
                "system",
                """
                You are a helpful book assistant.

                Use ONLY the provided context.

                If the answer is not found in the context,
                say:

                "I could not find this information in the book."

                Context:
                {context}
                """
            ),

            MessagesPlaceholder(
                variable_name="chat_history"
            ),

            (
                "human",
                "{input}"
            )
        ])

    
