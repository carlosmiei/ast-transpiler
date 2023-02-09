namespace Main;

using System.Globalization;
using System.Text.Json;


// make these methods available in your code (partial class, static, etc)

public partial class Helper
{

    // tmp most of these methods are going to be re-implemented in the future to be more generic and efficient

    public dict parseJson(object json)
    {
        return JsonSerializer.Deserialize<Dictionary<string, object>>((string)json);
    }

    public bool isTrue(object value)
    {
        if (value == null)
        {
            return false;
        }

        var i = 1;
        double d = 1.0;
        var s = i == d;

        // return value != null && value != false && value != 0 && value != "" && value != "0" && value != "false" && value != "False" && value != "FALSE";
        if (value.GetType() == typeof(bool))
        {
            return (bool)value;
        }
        else if (value.GetType() == typeof(int))
        {
            return (int)value != 0;
        }
        else if (value.GetType() == typeof(double))
        {
            return (double)value != 0;
        }
        else if (value.GetType() == typeof(string))
        {
            return (string)value != "";
        }
        else if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<string>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<int>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<Int64>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<double>))
        {
            return ((List<double>)value).Count > 0;
        }
        else
        {
            return false;
        }
    }

    public bool isEqual(object a, object b)
    {
        if (a == null && b == null)
        {
            return true;
        }
        else if (a == null || b == null)
        {
            return false;
        }

        if (a.GetType() != b.GetType())
        {
            return false;
        }

        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a == (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a == (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a == (double)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a == (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return ((string)a) == ((string)b);
        }
        else
        {
            return false;
        }
    }

    public bool isGreaterThan(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a > (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a > (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a > (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return ((string)a).CompareTo((string)b) > 0;
        }
        else
        {
            return false;
        }
    }

    public bool isLessThan(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a < (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a < (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a < (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return ((string)a).CompareTo((string)b) < 0;
        }
        else
        {
            return false;
        }
    }

    public bool isGreaterThanOrEqual(object a, object b)
    {
        return isGreaterThan(a, b) || isEqual(a, b);
    }

    public bool isLessThanOrEqual(object a, object b)
    {
        return isLessThan(a, b) || isEqual(a, b);
    }

    public object mod(object a, object b)
    {
        if (a == null || b == null)
        {
            return null;
        }
        if (a.GetType() != b.GetType())
            return null;

        if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int))
            return ((int)a) % ((int)b);

        return null;

        // return add(a, b);
    }

    public object add(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a + (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a + (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return (string)a + (string)b;
        }
        else
        {
            return null;
        }
    }

    public string add(string a, string b)
    {
        return a + b;
    }

    public string add(string a, object b)
    {
        return add(a, b.ToString());
    }

    public string add(object a, string b)
    {
        if (a == null || b == null)
        {
            return null;
        }
        if (a.GetType() != b.GetType())
            return null;

        if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int))
            return a + b;

        return null;

        // return add(a, b);
    }

    public int add(int a, int b)
    {
        return a + b;
    }

    public float add(float a, float b)
    {
        return a + b;
    }

    public object subtract(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a - (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a - (double)b;
        }
        else
        {
            return null;
        }
    }

    public int subtract(int a, int b)
    {
        return a - b;
    }

    public float subtract(float a, float b)
    {
        return a - b;
    }

    public object divide(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a / (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a / (double)b;
        }
        else
        {
            return null;
        }
    }

    public object multiply(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a * (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a * (double)b;
        }
        else
        {
            return null;
        }
    }

    public int getArrayLength(object value)
    {
        if (value == null)
        {
            return 0;
        }

        if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count;
        }
        else if (value.GetType() == typeof(List<string>))
        {
            return ((List<string>)value).Count;
        }
        else
        {
            return 0;
        }
    }

    public object mathMin(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return Math.Min((Int64)a, (Int64)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Min((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public object mathMax(object a, object b)
    {
        if (a.GetType() == typeof(Int64))
        {
            return Math.Max((Int64)a, (Int64)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Max((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public int getIndexOf(object a, object b)
    {
        if (a.GetType() == typeof(List<object>))
        {
            return ((List<object>)a).IndexOf(b);
        }
        else if (a.GetType() == typeof(List<string>))
        {
            return ((List<string>)a).IndexOf((string)b);
        }
        else
        {
            return -1;
        }
    }

    public int parseInt(object a)
    {
        return int.Parse((string)a);
    }

    public float parseFloat(object a)
    {
        return float.Parse((string)a, CultureInfo.InvariantCulture.NumberFormat);
    }

    // generic getValue to replace elementAccesses
    public object getValue(object value2, object key)
    {
        if (value2 == null || key == null)
        {
            return null;
        }

        // check if array
        object value = value2;
        if (value2.GetType().IsArray == true)
        {
            value = new List<object>((object[])value2);
        }


        if (value.GetType() == typeof(dict))
        {
            var dictValue = (dict)value;
            if (dictValue.ContainsKey((string)key))
            {
                return dictValue[(string)key];
            }
            else
            {
                return null;
            }
        }
        else if (value.GetType() == typeof(List<object>))
        {
            // check here if index is out of bounds
            var parsed = (int)key;
            var listLength = this.getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<object>)value)[parsed];
        }
        else if (value.GetType() == typeof(List<string>))
        {
            var parsed = (int)key;
            var listLength = this.getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<string>)value)[parsed];
        }
        else if (value.GetType() == typeof(List<Int64>))
        {
            var parsed = (int)key;
            return ((List<Int64>)value)[parsed];
        }
        // check this last, avoid reflection
        else if (key.GetType() == typeof(string) && (this.GetType()).GetProperty((string)key) != null)
        {
            var prop = (this.GetType()).GetProperty((string)key);
            if (prop != null)
            {
                return prop.GetValue(this, null);
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }
}
