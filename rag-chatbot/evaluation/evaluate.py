"""
Evaluation harness for Rainbow Ready Mades RAG Chatbot.
Evaluates grounding accuracy on supported business queries,
and refusal/fallback fidelity on unknown or out-of-domain queries.
"""

from pathlib import Path
import json
import sys
import time

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
CHATBOT_DIR = SCRIPT_DIR.parent
REPO_ROOT = CHATBOT_DIR.parent

for p in [str(REPO_ROOT), str(CHATBOT_DIR), str(SCRIPT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.rag import RAGPipeline, DETERMINISTIC_FALLBACK
from app.retriever import ChromaRetriever


def run_evaluation(test_file: Path = SCRIPT_DIR / "test_queries.json") -> dict:
    """
    Execute grounding and safety evaluation across test set.
    """
    print("=== Rainbow Ready Mades RAG Grounding & Safety Evaluation ===")
    print(f"Loading test queries from: {test_file}\n")

    with open(test_file, "r", encoding="utf-8") as f:
        tests = json.load(f)

    pipeline = RAGPipeline()

    total_tests = len(tests)
    passed_tests = 0
    results_by_category = {}

    start_time = time.time()

    for idx, test in enumerate(tests, start=1):
        test_id = test["id"]
        category = test["category"]
        query = test["query"]
        exp_grounded = test.get("expected_grounded", True)
        exp_keywords = test.get("expected_keywords", [])
        exp_fallback = test.get("expected_fallback", False)

        res = pipeline.process_query(query)
        actual_grounded = res["grounded"]
        response_text = res["response"]
        confidence = res["confidence_score"]

        passed = True
        failure_reasons = []

        if actual_grounded != exp_grounded:
            passed = False
            failure_reasons.append(f"Grounded mismatch: expected {exp_grounded}, got {actual_grounded}")

        if exp_fallback:
            if "don't have verified information" not in response_text and "do not have verified information" not in response_text:
                passed = False
                failure_reasons.append("Expected deterministic fallback refusal string")

        if exp_keywords:
            for kw in exp_keywords:
                if kw.lower() not in response_text.lower():
                    passed = False
                    failure_reasons.append(f"Missing expected keyword '{kw}'")

        if passed:
            passed_tests += 1
            status_symbol = "[PASS]"
        else:
            status_symbol = "[FAIL]"

        if category not in results_by_category:
            results_by_category[category] = {"total": 0, "passed": 0}
        results_by_category[category]["total"] += 1
        if passed:
            results_by_category[category]["passed"] += 1

        print(f"[{idx:02d}/{total_tests:02d}] {status_symbol} | ID: {test_id} | Cat: {category}")
        print(f"     Query: \"{query}\"")
        print(f"     Score: {confidence} | Grounded: {actual_grounded}")
        if not passed:
            print(f"     Errors: {', '.join(failure_reasons)}")
            print(f"     Response: {response_text[:120]}...")
        print()

    duration = round(time.time() - start_time, 2)
    overall_accuracy = round((passed_tests / total_tests) * 100, 2)

    print("=" * 65)
    print("                 EVALUATION SUMMARY REPORT")
    print("=" * 65)
    print(f"Total Test Cases: {total_tests}")
    print(f"Overall Passed:   {passed_tests}/{total_tests} ({overall_accuracy}%)")
    print(f"Elapsed Time:     {duration}s\n")

    print("Performance by Query Category:")
    for cat, stats in results_by_category.items():
        cat_pct = round((stats["passed"] / stats["total"]) * 100, 2)
        print(f"  - {cat:<18}: {stats['passed']}/{stats['total']} ({cat_pct}%)")

    print("=" * 65)
    return {
        "total": total_tests,
        "passed": passed_tests,
        "accuracy_pct": overall_accuracy,
        "categories": results_by_category,
        "duration_seconds": duration
    }


if __name__ == "__main__":
    run_evaluation()
