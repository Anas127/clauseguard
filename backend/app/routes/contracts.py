from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.dependencies import get_current_user
from app.services.parser import extract_text
from app.services.analyzer import analyze_contract
from app.database import get_supabase

router = APIRouter()
MAX_FREE_CONTRACTS = 2


@router.post("/upload")
async def upload_contract(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    sb = get_supabase()

    result = sb.table("users").select(
        "is_paid, contracts_used").eq("id", user_id).execute()

    if not result.data:
        sb.table("users").insert({
            "id": user_id,
            "email": current_user["email"],
            "is_paid": False,
            "contracts_used": 0,
        }).execute()
        is_paid, contracts_used = False, 0
    else:
        is_paid = result.data[0]["is_paid"]
        contracts_used = result.data[0]["contracts_used"]

    if not is_paid and contracts_used >= MAX_FREE_CONTRACTS:
        raise HTTPException(
            status_code=403, detail="Free limit reached. Upgrade to continue.")

    file_bytes = await file.read()
    try:
        raw_text = extract_text(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if len(raw_text.strip()) < 100:
        raise HTTPException(
            status_code=400, detail="Could not extract enough text from the document.")

    contract = sb.table("contracts").insert({
        "user_id": user_id,
        "filename": file.filename,
        "raw_text": raw_text,
    }).execute()

    sb.table("users").update(
        {"contracts_used": contracts_used + 1}).eq("id", user_id).execute()

    return {
        "contract_id": contract.data[0]["id"],
        "filename": file.filename,
        "char_count": len(raw_text),
    }


@router.get("/")
async def list_contracts(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("contracts")
        .select("id, filename, created_at, summary, danger_score")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/{contract_id}/analyze")
async def analyze(
    contract_id: str,
    current_user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    result = sb.table("contracts").select(
        "*").eq("id", contract_id).eq("user_id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = result.data[0]

    if contract.get("summary"):
        clauses = sb.table("clauses").select(
            "*").eq("contract_id", contract_id).execute()
        return {
            "summary": contract["summary"],
            "danger_score": contract.get("danger_score"),
            "parties": contract.get("parties"),
            "payment_terms": contract.get("payment_terms"),
            "termination": contract.get("termination"),
            "governing_law": contract.get("governing_law"),
            "clauses": clauses.data,
            "cached": True,
        }

    try:
        analysis = analyze_contract(contract["raw_text"])
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {str(e)}")

    sb.table("contracts").update({
        "summary": analysis.get("summary", ""),
        "danger_score": analysis.get("danger_score"),
        "parties": analysis.get("parties"),
        "payment_terms": analysis.get("payment_terms"),
        "termination": analysis.get("termination"),
        "governing_law": analysis.get("governing_law"),
    }).eq("id", contract_id).execute()

    clause_rows = []
    for c in analysis.get("clauses", []):
        clause_rows.append({
            "contract_id": contract_id,
            "type": c.get("type", "General"),
            "content": c.get("content", ""),
            "risk_level": c.get("risk_level", "low"),
            "flag_reason": c.get("flag_reason", None),
            "recommendation": c.get("recommendation", None),
        })

    if clause_rows:
        sb.table("clauses").insert(clause_rows).execute()

    return {
        "summary": analysis.get("summary"),
        "danger_score": analysis.get("danger_score"),
        "parties": analysis.get("parties"),
        "payment_terms": analysis.get("payment_terms"),
        "termination": analysis.get("termination"),
        "governing_law": analysis.get("governing_law"),
        "clauses": clause_rows,
        "cached": False,
    }
