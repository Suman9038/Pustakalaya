from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from app.rag.prompts import PromptTemplate


class RagChain:
    @staticmethod
    def build_chain(llm, retriever):

        history_aware_retriever= create_history_aware_retriever(
            llm,
            retriever,
            PromptTemplate.contextual_question_prompt()
        )

        document_chain = create_stuff_documents_chain(
            llm,
            PromptTemplate.qa_prompt()
        )

        rag_chain = create_retrieval_chain(
            history_aware_retriever,
            document_chain
        )

        return rag_chain
