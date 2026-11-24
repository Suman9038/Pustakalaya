from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from app.rag.prompts import PromptTemplate
from langchain_core.prompts import PromptTemplate as CorePromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_core.documents import Document


class RagChain:
    @staticmethod
    def build_chain(llm, retriever):
        """
        Build RAG chain with history-aware retriever.
        Wraps retriever to inject [NO_RELEVANT_CONTEXT] marker when no docs found.
        Formats document passages with clear page metadata for citation tracking.
        """

        def _normalize_docs(docs):
            if not docs:
                return [Document(page_content="[NO_RELEVANT_CONTEXT]", metadata={"page": 1})]
            for d in docs:
                if not hasattr(d, "metadata") or d.metadata is None:
                    d.metadata = {}
                if "page" not in d.metadata:
                    d.metadata["page"] = 1
            return docs

        def inject_no_context_marker(inputs):
            """Wrap retriever to inject marker when empty results (sync)."""
            docs = retriever.invoke(inputs)
            return _normalize_docs(docs)

        async def ainject_no_context_marker(inputs):
            """Wrap retriever to inject marker when empty results (async non-blocking)."""
            docs = await retriever.ainvoke(inputs)
            return _normalize_docs(docs)

        wrapped_retriever = RunnableLambda(
            inject_no_context_marker,
            afunc=ainject_no_context_marker
        )

        history_aware_retriever = create_history_aware_retriever(
            llm,
            wrapped_retriever,
            PromptTemplate.contextual_question_prompt()
        )

        document_prompt = CorePromptTemplate.from_template(
            "[Source: Page {page}]:\n{page_content}"
        )

        document_chain = create_stuff_documents_chain(
            llm,
            PromptTemplate.qa_prompt(),
            document_prompt=document_prompt
        )

        rag_chain = create_retrieval_chain(
            history_aware_retriever,
            document_chain
        )

        return rag_chain
