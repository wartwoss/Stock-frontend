import re

with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    credits = f.read()

# Remove CheckCircle2 from import
credits = credits.replace('  CheckCircle2,\n', '')

# Remove unused err variables
credits = credits.replace('} catch (err) {\n      setError(', '} catch (error) {\n      setError(')
credits = credits.replace('} catch (err) {\n      setPayments([]);', '} catch (error) {\n      setPayments([]);')

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(credits)

print("Fixed unused variables")
