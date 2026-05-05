# backend/applications/services/code_execution.py
import json
import subprocess
import tempfile
import os

def execute_python_code(code, test_case):
    wrapped_code = f"""
import sys
import json
from io import StringIO

# Code du candidat
{code}

# Test
try:
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    input_value = {json.dumps(test_case.get("input"))}
    result = solution(input_value)
    
    sys.stdout = old_stdout
    
    print(json.dumps({{"result": result}}))
except Exception as e:
    print(json.dumps({{"error": str(e)}}))
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(wrapped_code)
        temp_file = f.name
    
    try:
        result = subprocess.run(
            ["python", temp_file],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        output = result.stdout.strip()
        
        if output:
            try:
                start = output.find('{')
                end = output.rfind('}')
                if start != -1 and end != -1:
                    json_str = output[start:end+1]
                    data = json.loads(json_str)
                    if "error" in data:
                        return {"error": data["error"]}
                    return {"output": data.get("result")}
            except:
                return {"output": output}
        
        if result.stderr:
            return {"error": result.stderr[:500]}
        
        return {"output": None}
        
    except subprocess.TimeoutExpired:
        return {"error": "Timeout (5 secondes maximum)"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        try:
            os.unlink(temp_file)
        except:
            pass


def execute_javascript_code(code, test_case):
    wrapped_code = f"""
const code = `{code}`;
eval(code);

try {{
    const inputValue = {json.dumps(test_case.get("input"))};
    const result = solution(inputValue);
    console.log(JSON.stringify({{"result": result}}));
}} catch(e) {{
    console.log(JSON.stringify({{"error": e.message}}));
}}
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(wrapped_code)
        temp_file = f.name
    
    try:
        result = subprocess.run(
            ["node", temp_file],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        output = result.stdout.strip()
        
        if output:
            try:
                start = output.find('{')
                end = output.rfind('}')
                if start != -1 and end != -1:
                    json_str = output[start:end+1]
                    data = json.loads(json_str)
                    if "error" in data:
                        return {"error": data["error"]}
                    return {"output": data.get("result")}
            except:
                return {"output": output}
        
        if result.stderr:
            return {"error": result.stderr[:500]}
        
        return {"output": None}
        
    except subprocess.TimeoutExpired:
        return {"error": "Timeout (5 secondes maximum)"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        try:
            os.unlink(temp_file)
        except:
            pass